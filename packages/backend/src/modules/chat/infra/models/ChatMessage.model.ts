import {
    BaseEntity,
    Column,
    Entity,
    Index,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatMessageSender } from '../../domain/models/ChatMessage';

export interface ChatMessageModelProps {
    id: string;
    content: string;
    sender: ChatMessageSender;
    userId: string;
    sessionId: string;
    createdAt: Date;
}

@Entity('chat_message')
@Index(['sessionId', 'userId'])
export class ChatMessageModel
    extends BaseEntity
    implements ChatMessageModelProps
{
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ type: 'varchar', length: 10 })
    sender: ChatMessageSender;

    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @Column({ name: 'session_id', type: 'varchar', length: 100 })
    sessionId: string;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        name: 'created_at',
    })
    createdAt: Date;

    setProps(props: ChatMessageModelProps): this {
        Object.assign(this, props);
        return this;
    }
}
