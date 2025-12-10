import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { ReporterProfile } from "./ReporterProfile";
import { EventInfo } from "./EventInfo";
import { SummaryInfo } from "./SummaryInfo";
import { User } from "./User";
import { EventImage } from "./EventImage";

@Entity()
export class EventReport {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, user => user.reports, { eager: true })
  reporter: User;

  @ManyToOne(() => ReporterProfile, profile => profile.reports, { cascade: true, eager: true })
  reporterProfile: ReporterProfile;

  @OneToOne(() => EventInfo, { cascade: true, eager: true })
  @JoinColumn()
  eventInfo: EventInfo;

  @OneToOne(() => SummaryInfo, { cascade: true, eager: true })
  @JoinColumn()
  summaryInfo: SummaryInfo;

  @OneToMany(() => EventImage, (image) => image.report, { cascade: true, eager: true })
  images: EventImage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
