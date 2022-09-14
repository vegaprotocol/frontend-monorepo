// since e2e apps are build with raw tsc, these builds fail when hit with scss imports, e.g. from market-depth
declare module '*.scss' {
    const content: Record<string, string>;
    export default content;
}
