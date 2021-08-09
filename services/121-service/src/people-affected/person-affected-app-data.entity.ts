import { UserEntity } from '../user/user.entity';
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { PaDataTypes } from './enum/padata-types.enum';

@Entity('people_affected_app_data')
export class PersonAffectedAppDataEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public type: PaDataTypes;

  @Column()
  public data: string;

  @ManyToOne(
    () => UserEntity,
    user => user.personAffectedAppData,
  )
  public user: UserEntity;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public created: Date;
}
