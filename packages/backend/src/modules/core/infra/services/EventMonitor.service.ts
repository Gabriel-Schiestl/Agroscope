import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CalendarRepository } from 'src/modules/core/domain/repositories/Calendar.repository';
import { Inject } from '@nestjs/common';
import { CalendarEvent } from '../../domain/models/CalendarEvent';
import { UserRepository } from '../../domain/repositories/User.repository';

@Injectable()
export class EventMonitorService {
    private readonly logger = new Logger(EventMonitorService.name);

    constructor(
        @Inject('CalendarRepository')
        private readonly calendarRepository: CalendarRepository,
        @Inject('UserRepository')
        private readonly userRepository: UserRepository,
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
