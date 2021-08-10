import { UserEntity } from '../user/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Column,
  OneToMany,
  AfterUpdate,
  AfterInsert,
} from 'typeorm';
import { ProgramEntity } from '../programs/program/program.entity';
import { RegistrationStatusEnum } from './registration-status.enum';
import { ProgramAnswersEntity } from './program-answer.entity';

@Entity('registration')
export class RegistrationEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @ManyToOne(
    type => ProgramEntity,
    program => program.registrations,
  )
  public program: ProgramEntity;

  @ManyToOne(() => UserEntity)
  public user: UserEntity;

  @AfterUpdate()
  @AfterInsert()
  public storeRegistrationStatusChange(): void {}

  @Index()
  @Column()
  public registrationStatus: RegistrationStatusEnum;

  @Column({ nullable: true })
  public qrCode: string;

  @Index({ unique: true })
  @Column()
  public referenceId: string;

  @OneToMany(
    () => ProgramAnswersEntity,
    programAnswer => programAnswer.registration,
  )
  public programAnswers: ProgramAnswersEntity[];
}
