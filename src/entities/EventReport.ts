import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { ReporterProfile } from "./ReporterProfile";
import { EventInfo } from "./EventInfo";
import { SummaryInfo } from "./SummaryInfo";
import { User } from "./User";

@Entity()
export class EventReport {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, user => user.reports, { eager: true })
  reporter: User;

  @ManyToOne(() => ReporterProfile, profile => profile.reports, { eager: true })
  reporterProfile: ReporterProfile;

  @OneToOne(() => EventInfo, { cascade: true, eager: true })
  @JoinColumn()
  eventInfo: EventInfo;

  @OneToOne(() => SummaryInfo, { cascade: true, eager: true })
  @JoinColumn()
  summaryInfo: SummaryInfo;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updatedAt: Date;
}
