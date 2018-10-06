// @flow
import * as React from "react";
import { Value, Change, Schema, Text } from "slate";
import { Editor } from "slate-react";
import styled from "react-emotion";
import { ThemeProvider } from "emotion-theming";
import type { SlateNodeProps, Plugin, Ref, SearchResult } from "./types";
import { light as lightTheme, dark as darkTheme } from "./theme";
import defaultSchema from "./schema";
import getDataTransferFiles from "./lib/getDataTransferFiles";
import isModKey from "./lib/isModKey";
import Flex from "./components/Flex";
import Toolbar from "./components/Toolbar";
import BlockInsert from "./components/BlockInsert";
import InternalPlaceholder from "./components/Placeholder";
import Contents from "./components/Contents";
import Markdown from "./serializer";
import createPlugins from "./plugins";
import { insertImageFile } from "./changes";
import renderMark from "./marks";
import renderNode from "./nodes";

export const theme = lightTheme;
export const schema = defaultSchema;
export const Placeholder = InternalPlaceholder;

type Props = {
  defaultValue: string,
  placeholder: string,
  pretitle?: string,
  plugins?: Plugin[],
  portalRef?: Ref,
  autoFocus?: boolean,
  hideBlockInsert?: boolean,
  readOnly?: boolean,
  spellCheck?: boolean,
  toc?: boolean,
  dark?: boolean,
  schema?: Schema,
  theme?: Object,
  uploadImage?: (file: File) => Promise<string>,
  onSave?: ({ done?: boolean }) => *,
  onCancel?: () => *,
  onChange: (value: () => string) => *,
  onImageUploadStart?: () => *,
  onImageUploadStop?: () => *,
  onSearchLink?: (term: string) => Promise<SearchResult[]>,
  onClickLink?: (href: string) => *,
  onShowToast?: (message: string) => *,
  renderNode?: SlateNodeProps => ?React.Node,
  renderPlaceholder?: SlateNodeProps => ?React.Node,
  className?: string,
  style?: Object,
};

type State = {
  editorValue: Value,
  editorLoaded: boolean,
};

class RichMarkdownEditor extends React.PureComponent<Props, State> {
  static defaultProps = {
    defaultValue: "",
    hideBlockInsert: false,
    onImageUploadStart: () => {},
    onImageUploadStop: () => {},
    placeholder: "Write something nice…",
    spellCheck: false,
  };

  editor: Editor;
  plugins: Plugin[];
  prevSchema: ?Schema = null;
  schema: ?Schema = null;

  constructor(props: Props) {
    super(props);

    this.plugins = createPlugins();
    if (props.plugins) {
      if (Array.isArray(props.plugins)) {
        this.plugins = props.plugins.concat(this.plugins);
      } else {
        console.warn("Editor.plugins prop must be an array of Slate plugins");
      }
    }
    this.state = {
      editorLoaded: false,
      editorValue: Markdown.deserialize(props.defaultValue),
    };
  }

  componentDidMount() {
    if (this.props.readOnly) return;
    window.addEventListener("keydown", this.handleKeyDown);

    if (this.props.autoFocus) {
      this.focusAtEnd();
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.readOnly && !this.props.readOnly && this.props.autoFocus) {
      this.focusAtEnd();
    }
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown);
  }

  setEditorRef = (ref: Editor) => {
    this.editor = ref;
    // Force re-render to show ToC (<Content />)
    this.setState({ editorLoaded: true });
  };

  value = (): string => {
    return Markdown.serialize(this.state.editorValue);
  };

  handleChange = (change: Change) => {
    if (this.state.editorValue !== change.value) {
      this.setState({ editorValue: change.value }, state => {
        if (this.props.onChange && !this.props.readOnly) {
          this.props.onChange(this.value);
        }
      });
    }
  };

  handleDrop = async (ev: SyntheticDragEvent<*>) => {
    if (this.props.readOnly) return;

    // check an image upload callback is defined
    if (!this.editor.props.uploadImage) return;

    // check if this event was already handled by the Editor
    if (ev.isDefaultPrevented()) return;

    // otherwise we'll handle this
    ev.preventDefault();
    ev.stopPropagation();

    const files = getDataTransferFiles(ev);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith("image/")) {
        await this.insertImageFile(file);
      }
    }
  };

  insertImageFile = (file: window.File) => {
    this.editor.change(change =>
      change.call(insertImageFile, file, this.editor)
    );
  };

  cancelEvent = (ev: SyntheticEvent<*>) => {
    ev.preventDefault();
  };

  onSave(ev: SyntheticKeyboardEvent<*>) {
    const { onSave } = this.props;
    if (onSave) {
      ev.preventDefault();
      ev.stopPropagation();
      onSave({ done: false });
    }
  }

  onSaveAndExit(ev: SyntheticKeyboardEvent<*>) {
    const { onSave } = this.props;
    if (onSave) {
      ev.preventDefault();
      ev.stopPropagation();
      onSave({ done: true });
    }
  }

  onCancel(ev: SyntheticKeyboardEvent<*>) {
    const { onCancel } = this.props;
    if (onCancel) {
      ev.preventDefault();
      ev.stopPropagation();
      onCancel();
    }
  }

  handleKeyDown = (ev: SyntheticKeyboardEvent<*>) => {
    if (this.props.readOnly) return;

    switch (ev.key) {
      case "s":
        if (isModKey(ev)) this.onSave(ev);
        return;
      case "Enter":
        if (isModKey(ev)) this.onSaveAndExit(ev);
        return;
      case "Escape":
        if (isModKey(ev)) this.onCancel(ev);
        return;
      default:
    }
  };

  focusAtStart = () => {
    this.editor.change(change =>
      change.collapseToStartOf(change.value.document).focus()
    );
  };

  focusAtEnd = () => {
    this.editor.change(change =>
      change.collapseToEndOf(change.value.document).focus()
    );
  };

  isSpellCheckEnabled = () => {
    const { readOnly, spellCheck } = this.props;
    return readOnly ? false : spellCheck;
  };

  renderNode = (props: SlateNodeProps) => {
    const node = this.props.renderNode && this.props.renderNode(props);
    if (node) return node;

    return renderNode(props);
  };

  renderPlaceholder = (props: SlateNodeProps) => {
    if (this.props.renderPlaceholder) {
      return this.props.renderPlaceholder(props);
    }
    const { editor, node } = props;

    if (!editor.props.placeholder) return;
    if (editor.state.isComposing) return;
    if (node.object !== "block") return;
    if (!Text.isTextList(node.nodes)) return;
    if (node.text !== "") return;
    if (editor.value.document.getBlocks().size > 1) return;

    return (
      <Placeholder>
        {editor.props.readOnly ? "" : editor.props.placeholder}
      </Placeholder>
    );
  };

  getSchema = () => {
    if (this.prevSchema !== this.props.schema) {
      this.schema = {
        ...defaultSchema,
        ...(this.props.schema || {}),
      };
      this.prevSchema = this.props.schema;
    }
    return this.schema;
  };

  render = () => {
    const {
      readOnly,
      hideBlockInsert,
      toc,
      pretitle,
      placeholder,
      portalRef,
      onSave,
      uploadImage,
      onSearchLink,
      onClickLink,
      onImageUploadStart,
      onImageUploadStop,
      onShowToast,
      className,
      style,
      dark,
    } = this.props;

    const theme = this.props.theme || (dark ? darkTheme : lightTheme);

    return (
      <Flex
        style={style}
        className={className}
        onDrop={this.handleDrop}
        onDragOver={this.cancelEvent}
        onDragEnter={this.cancelEvent}
        align="flex-start"
        justify="center"
        column
        auto
      >
        <ThemeProvider theme={theme}>
          <React.Fragment>
            {toc &&
              this.state.editorLoaded &&
              this.editor && <Contents editor={this.editor} />}
            {!readOnly &&
              this.editor && (
                <Toolbar value={this.state.editorValue} editor={this.editor} />
              )}
            {!readOnly &&
              !hideBlockInsert &&
              this.editor && (
                <BlockInsert
                  editor={this.editor}
                  forwardedRef={portalRef}
                  onInsertImage={this.insertImageFile}
                />
              )}
            <StyledEditor
              innerRef={this.setEditorRef}
              plugins={this.plugins}
              value={this.state.editorValue}
              placeholder={placeholder}
              renderPlaceholder={this.renderPlaceholder}
              renderNode={this.renderNode}
              renderMark={renderMark}
              schema={this.getSchema()}
              onKeyDown={this.handleKeyDown}
              onChange={this.handleChange}
              onSave={onSave}
              onSearchLink={onSearchLink}
              onClickLink={onClickLink}
              onImageUploadStart={onImageUploadStart}
              onImageUploadStop={onImageUploadStop}
              onShowToast={onShowToast}
              readOnly={readOnly}
              spellCheck={this.isSpellCheckEnabled()}
              uploadImage={uploadImage}
              pretitle={pretitle}
            />
          </React.Fragment>
        </ThemeProvider>
      </Flex>
    );
  };
}

const StyledEditor = styled(Editor)`
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  flex: 0;
  font-family: ${props => props.theme.fontFamily};
  font-size: 0.875rem;
  font-style: normal;
  font-weight: normal;
  line-height: 1.4;
  width: 100%;

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-family: ${props => props.theme.fontFamilyBold};
    font-style: normal;
    font-weight: normal;
  }

  ul,
  ol {
    margin: 0;
    padding: 0;

    li {
      padding-left: 0;
    }
  }

  ul {
    list-style-type: disc;
    margin-left: 1.5em;
  }

  ol {
    list-style-type: decimal;
    margin-left: 1.25em;

    li {
      padding-left: 0.25em;
    }
  }

  p {
    position: relative;
    margin: 0;
  }

  a {
    color: ${props => props.theme.link};
  }

  a:hover {
    text-decoration: ${props => (props.readOnly ? "underline" : "none")};
  }

  li p {
    display: inline;
    margin: 0;
  }

  .todoList {
    list-style: none;
    padding-left: 0;

    .todoList {
      padding-left: 1em;
    }
  }

  .todo {
    span:last-child:focus {
      outline: none;
    }
  }

  blockquote {
    border-left: 1px solid ${props => props.theme.quote};
    margin: 0;
    padding-left: 1.5em;
    font-style: italic;
  }

  table {
    border-collapse: collapse;
  }

  tr {
    border-bottom: 1px solid #eee;
  }

  th {
    font-family: ${props => props.theme.fontFamilyBold};
    font-style: normal;
    font-weight: normal;
  }

  th,
  td {
    padding: ${({ theme: { gridSize } }) =>
      `${gridSize / 2}px ${gridSize * 2}px ${gridSize / 2} 0`};
  }

  b,
  strong {
    font-family: ${props => props.theme.fontFamilyBold};
    font-style: normal;
    font-weight: normal;
  }

  span[data-slate-zero-width] {
    display: inline-block;
  }
`;

export default RichMarkdownEditor;
