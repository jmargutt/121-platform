import { UserEntity } from './../user/user.entity';
import { Module, HttpModule, forwardRef } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramEntity } from '../programs/program.entity';
import { PaymentsService } from './payments.service';
import { UserModule } from '../user/user.module';
import { TransactionEntity } from './transactions/transaction.entity';
import { RegistrationEntity } from '../registration/registration.entity';
import { ActionModule } from '../actions/action.module';
import { AfricasTalkingModule } from './africas-talking/africas-talking.module';
import { FspModule } from '../fsp/fsp.module';
import { IntersolveModule } from './intersolve/intersolve.module';
import { TransactionsModule } from './transactions/transactions.module';
import { BelcashModule } from './belcash/belcash.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProgramEntity,
      TransactionEntity,
      RegistrationEntity,
      UserEntity,
    ]),
    UserModule,
    HttpModule,
    ActionModule,
    FspModule,
    IntersolveModule,
    AfricasTalkingModule,
    BelcashModule,
    TransactionsModule,
  ],
  providers: [PaymentsService],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
