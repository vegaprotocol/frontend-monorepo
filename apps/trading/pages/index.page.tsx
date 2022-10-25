export function Index() {
  throw new Error('should not render');
}

Index.getInitialProps = () => ({
  page: 'home',
});

export default Index;
