// Manual mock for next/image
const React = require("react");
module.exports = {
  __esModule: true,
  default: React.forwardRef(function MockImage(props, ref) {
    return React.createElement("img", {
      ...props,
      ref: ref,
      alt: props.alt || "",
    });
  }),
};
