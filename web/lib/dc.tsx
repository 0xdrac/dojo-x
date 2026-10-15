import React from "react";

/**
 * Base class for screens ported from the design prototypes. `renderVals()` returns the flat object the
 * template reads from (merged over props); `renderTemplate(v)` is the JSX generated from the .dc.html template.
 */
export class DCLogic extends React.Component<any, any> {
  state: any = {};
  renderVals(): any { return {}; }
  renderTemplate(_v: any): React.ReactNode { return null; }
  render() { return this.renderTemplate({ ...this.props, ...this.renderVals() }); }
}
