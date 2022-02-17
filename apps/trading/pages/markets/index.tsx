import Link from 'next/link';
import { useRouter } from 'next/router';

const Markets = () => {
  const router = useRouter();
  return (
    <div>
      <h1>Markets</h1>
      <Link href={`${router.pathname}/ABC`}>View market ABC</Link>
    </div>
  );
};

export default Markets;
