// import packageJson from "../../../package.json";

export const Footer = () => {
  return (
    <footer>
      <section>
        <div>Reading Vega Fairground data from </div>
        <div>
          {/* Version/commit hash: {packageJson.version} / */}
          {process.env['NX_COMMIT_REF'] || 'dev'}
        </div>
      </section>
    </footer>
  );
};
