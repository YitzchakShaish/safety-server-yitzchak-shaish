import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class UserAudit {
    @PrimaryGeneratedColumn("uuid")
    id: string;
    @Column()
    actorId: string;
    @Column()
    userId: string;
    @Column("simple-json")
    before: object;
    @Column("simple-json")
    after: object;
    @CreateDateColumn()
    createdAt: Date;
}
