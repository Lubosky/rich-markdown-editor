"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _debounce2 = require("lodash/debounce");

var _debounce3 = _interopRequireDefault(_debounce2);

var _isEqual2 = require("lodash/isEqual");

var _isEqual3 = _interopRequireDefault(_isEqual2);

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var React = _interopRequireWildcard(_react);

var _reactPortal = require("react-portal");

var _slateReact = require("slate-react");

var _slate = require("slate");

var _reactEmotion = require("react-emotion");

var _reactEmotion2 = _interopRequireDefault(_reactEmotion);

var _FormattingToolbar = require("./FormattingToolbar");

var _FormattingToolbar2 = _interopRequireDefault(_FormattingToolbar);

var _LinkToolbar = require("./LinkToolbar");

var _LinkToolbar2 = _interopRequireDefault(_LinkToolbar);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function getLinkInSelection(value) {
  try {
    var selectedLinks = value.document.getInlinesAtRange(value.selection).filter(function (node) {
      return node.type === "link";
    });

    if (selectedLinks.size) {
      var _link = selectedLinks.first();
      if (value.selection.hasEdgeIn(_link)) return _link;
    }
  } catch (err) {
    // It's okay.
  }
}

var Toolbar = function (_React$Component) {
  _inherits(Toolbar, _React$Component);

  function Toolbar(props) {
    _classCallCheck(this, Toolbar);

    var _this = _possibleConstructorReturn(this, (Toolbar.__proto__ || Object.getPrototypeOf(Toolbar)).call(this, props));

    _this.componentDidMount = function () {
      _this.update();
      window.addEventListener("mousedown", _this.handleMouseDown);
      window.addEventListener("mouseup", _this.handleMouseUp);
    };

    _this.componentWillUnmount = function () {
      _this.update.cancel();
      window.removeEventListener("mousedown", _this.handleMouseDown);
      window.removeEventListener("mouseup", _this.handleMouseUp);
    };

    _this.componentDidUpdate = function () {
      _this.update();
    };

    _this.hideLinkToolbar = function () {
      _this.setState({ link: undefined });
    };

    _this.handleMouseDown = function () {
      _this.setState({ mouseDown: true });
    };

    _this.handleMouseUp = function () {
      _this.setState({ mouseDown: false });
    };

    _this.showLinkToolbar = function (ev) {
      ev.preventDefault();
      ev.stopPropagation();

      var link = getLinkInSelection(_this.props.value);
      _this.setState({ link: link });
    };

    _this.update = (0, _debounce3.default)(function () {
      var value = _this.props.value;

      var link = getLinkInSelection(value);
      var selection = window.getSelection();

      // value.isCollapsed is not correct when the user clicks outside of the Slate bounds
      // checking the window selection collapsed state as a fallback for this case
      var isCollapsed = value.isCollapsed || selection.isCollapsed;

      if (isCollapsed && !link) {
        if (_this.state.active) {
          var _newState = _extends({}, _this.state, {
            active: false,
            link: undefined,
            top: "",
            left: ""
          });

          if (!(0, _isEqual3.default)(_this.state, _newState)) {
            _this.setState(_newState);
          }
        }
        return;
      }

      var active = true;

      if (!value.startBlock) return;

      // don't display toolbar for document title
      if (value.startBlock.type === "heading1") active = false;

      // don't display toolbar for code blocks, code-lines or inline code
      if (value.startBlock.type.match(/code/)) active = false;

      // don't show until user has released pointing device button
      if (_this.state.mouseDown && !link) active = false;

      var newState = _extends({}, _this.state, {
        active: active,
        link: _this.state.link || link,
        top: undefined,
        left: undefined
      });
      var padding = 16;
      var rect = void 0;

      if (link) {
        rect = (0, _slateReact.findDOMNode)(link).getBoundingClientRect();
      } else if (selection.rangeCount > 0) {
        var range = selection.getRangeAt(0);
        rect = range.getBoundingClientRect();
      }

      if (!rect || !_this.menu || rect.top === 0 && rect.left === 0) {
        return;
      }

      var menu = _this.menu.current;
      if (!menu) {
        return;
      }

      var left = rect.left + window.scrollX - menu.offsetWidth / 2 + rect.width / 2;
      newState.top = Math.round(rect.top + window.scrollY - menu.offsetHeight) + "px";
      newState.left = Math.round(Math.max(padding, left)) + "px";

      if (!(0, _isEqual3.default)(_this.state, newState)) {
        _this.setState(newState);
      }
    }, 100);


    _this.menu = props.forwardedRef || React.createRef();

    _this.state = {
      active: false,
      mouseDown: false,
      link: undefined,
      top: "",
      left: ""
    };
    return _this;
  }

  _createClass(Toolbar, [{
    key: "render",
    value: function render() {
      var style = {
        top: this.state.top,
        left: this.state.left
      };

      return React.createElement(
        _reactPortal.Portal,
        null,
        React.createElement(
          Menu,
          { active: this.state.active, innerRef: this.menu, style: style },
          this.state.link ? React.createElement(_LinkToolbar2.default, _extends({}, this.props, {
            link: this.state.link,
            onBlur: this.hideLinkToolbar
          })) : React.createElement(_FormattingToolbar2.default, _extends({
            onCreateLink: this.showLinkToolbar
          }, this.props))
        )
      );
    }
  }]);

  return Toolbar;
}(React.Component);

exports.default = Toolbar;


var Menu = /*#__PURE__*/(0, _reactEmotion2.default)("div", {
  target: "edgimsw0"
})("padding:8px 16px;position:absolute;z-index:300;top:-10000px;left:-10000px;opacity:0;background-color:", function (props) {
  return props.theme.toolbarBackground;
}, ";border-radius:4px;transform:scale(0.95);transition:opacity 150ms cubic-bezier(0.175,0.885,0.32,1.275),transform 150ms cubic-bezier(0.175,0.885,0.32,1.275);transition-delay:250ms;line-height:0;height:40px;box-sizing:border-box;pointer-events:none;*{box-sizing:border-box;}", function (_ref) {
  var active = _ref.active;
  return active && "\n    transform: translateY(-6px) scale(1);\n    pointer-events: all;\n    opacity: 1;\n  ";
}, ";@media print{display:none;}");