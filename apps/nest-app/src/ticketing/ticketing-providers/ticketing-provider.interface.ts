import { Ticket, TicketCreate } from '../ticketing.types';

export interface ITicketingProvider {
  createTicket(ticket: TicketCreate): Promise<Ticket>;
  getTicket(ticketId: string): Promise<Ticket | null>;
  updateTicket(
    ticketId: string,
    props: Pick<Ticket, 'title' | 'description' | 'status'>,
  ): Promise<Ticket>;
}
