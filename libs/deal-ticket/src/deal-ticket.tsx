import styles from './deal-ticket.module.scss';

/* eslint-disable-next-line */
export interface DealTicketProps {}

export function DealTicket(props: DealTicketProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to DealTicket!</h1>
    </div>
  );
}

export default DealTicket;
