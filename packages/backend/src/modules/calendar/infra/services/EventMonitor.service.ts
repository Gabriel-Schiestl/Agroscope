import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CalendarRepository } from 'src/modules/calendar/domain/repositories/Calendar.repository';
import { CalendarEvent } from '../../domain/models/CalendarEvent';
import { UserRepository } from '../../../core/domain/repositories/User.repository';
import { AgriculturalEngineerRepository } from '../../../engineer/domain/repositories/AgriculturalEngineer.repository';
import { EventEmail } from '../../../core/domain/models/EventEmail';
import { ProducerService } from 'src/shared/domain/services/Producer.service';

@Injectable()
export class EventMonitorService {
    private readonly logger = new Logger(EventMonitorService.name);

    constructor(
        @Inject('CalendarRepository')
        private readonly calendarRepository: CalendarRepository,
        @Inject('UserRepository')
        private readonly userRepository: UserRepository,
        @Inject('AgriculturalEngineerRepository')
        private readonly engineerRepository: AgriculturalEngineerRepository,
        @Inject('EmailProducerService')
        private readonly emailProducer: ProducerService,
    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_8AM)
    async checkUpcomingEvents() {
        this.logger.log(
            'Iniciando verificação de eventos próximos à data de vencimento',
        );

        try {
            const users = await this.userRepository.getAll();
            if (users.isFailure()) {
                this.logger.warn('Nenhum usuário encontrado');
                return;
            }

            this.logger.log(`Verifying events for ${users.value.length} users`);

            for (const user of users.value) {
                const calendarResult =
                    await this.calendarRepository.findByUserId(user.id);

                if (calendarResult.isFailure()) {
                    this.logger.warn(
                        `Calendário não encontrado para o usuário ${user.id}`,
                    );
                    continue;
                }

                const eventsOneDayAway = this.getEventsDueInOneDay(
                    calendarResult.value.events,
                );

                if (eventsOneDayAway.length > 0) {
                    this.logger.log(
                        `${eventsOneDayAway.length} next events found for user ${user.id}`,
                    );

                    for (const event of eventsOneDayAway) {
                        this.emailProducer.sendMessage(
                            'email',
                            new EventEmail({
                                to: user.email,
                                templateId: 5,
                                subject: 'Evento agendado para amanhã',
                                params: {
                                    name: user.name,
                                    eventTitle: event.title,
                                    eventDate: event.date,
                                    eventDescription: event.description,
                                    eventLocation: event.location,
                                    eventTime: event.time,
                                },
                            }),
                        );

                        if (event.clientId) {
                            const engineer =
                                await this.engineerRepository.getByUserId(
                                    user.id,
                                );
                            if (engineer.isFailure()) continue;

                            const withClientes =
                                await this.engineerRepository.getWithClients(
                                    engineer.value.id,
                                );
                            if (withClientes.isFailure()) continue;

                            const client = withClientes.value.find(
                                (client) => client.id === event.clientId,
                            );
                            if (client) {
                                this.emailProducer.sendMessage(
                                    'email',
                                    new EventEmail({
                                        to: client.email,
                                        templateId: 5,
                                        subject: 'Evento agendado para amanhã',
                                        params: {
                                            name: client.name,
                                            eventTitle: event.title,
                                            eventDate: event.date,
                                            eventDescription: event.description,
                                            eventLocation: event.location,
                                            eventTime: event.time,
                                        },
                                    }),
                                );
                            }
                        }

                        this.logger.log(
                            `Event "${event.title}" scheduled for tomorrow - user ${user.id}`,
                        );
                    }
                }
            }

            this.logger.log('Verificação de eventos concluída com sucesso');
        } catch (error) {
            this.logger.error('Erro ao verificar eventos próximos', error);
        }
    }

    private getEventsDueInOneDay(events: CalendarEvent[]): CalendarEvent[] {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        return events.filter((event) => {
            const eventDate = new Date(event.date);
            eventDate.setHours(0, 0, 0, 0);

            return eventDate.getTime() === tomorrow.getTime();
        });
    }
}
