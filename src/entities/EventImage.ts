import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { EventReport } from "./EventReport";

@Entity()
export class EventImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fileName: string;

  @Column()
  filePath: string; 

  @ManyToOne(() => EventReport, (report) => report.images, { onDelete: "CASCADE" })
  report: EventReport;

  @Column()
  reportId: number;
}
