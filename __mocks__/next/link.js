// Manual mock for next/link
const React = require("react");
module.exports = {
  __esModule: true,
  default: React.forwardRef(function MockLink({ children, href, ...props }, ref) {
    return React.createElement("a", { ref: ref, href: href, ...props }, children);
  }),
};
