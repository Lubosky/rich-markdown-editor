"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var React = _interopRequireWildcard(_react);

var _copyToClipboard = require("copy-to-clipboard");

var _copyToClipboard2 = _interopRequireDefault(_copyToClipboard);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CopyToClipboard = function (_React$Component) {
  _inherits(CopyToClipboard, _React$Component);

  function CopyToClipboard() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, CopyToClipboard);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = CopyToClipboard.__proto__ || Object.getPrototypeOf(CopyToClipboard)).call.apply(_ref, [this].concat(args))), _this), _this.onClick = function (ev) {
      var _this$props = _this.props,
          text = _this$props.text,
          onCopy = _this$props.onCopy,
          children = _this$props.children;

      var elem = React.Children.only(children);
      (0, _copyToClipboard2.default)(text);

      if (onCopy) onCopy();

      if (elem && elem.props && typeof elem.props.onClick === "function") {
        elem.props.onClick(ev);
      }
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(CopyToClipboard, [{
    key: "render",
    value: function render() {
      var _props = this.props,
          _text = _props.text,
          _onCopy = _props.onCopy,
          children = _props.children,
          rest = _objectWithoutProperties(_props, ["text", "onCopy", "children"]);

      var elem = React.Children.only(children);
      return React.cloneElement(elem, _extends({}, rest, { onClick: this.onClick }));
    }
  }]);

  return CopyToClipboard;
}(React.Component);

exports.default = CopyToClipboard;