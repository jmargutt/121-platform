import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import instanceKrcs from '../../seed-data/instance/instance-krcs.json';
import programKrcs from '../../seed-data/program/program-krcs.json';
import { InterfaceScript } from './scripts.module';
import { SeedHelper } from './seed-helper';
import { SeedInit } from './seed-init';

@Injectable()
export class SeedProgramKrcs implements InterfaceScript {
  public constructor(private dataSource: DataSource) {}

  private readonly seedHelper = new SeedHelper(this.dataSource);

  public async run(): Promise<void> {
    const seedInit = await new SeedInit(this.dataSource);
    await seedInit.run();

    // ***** CREATE PROGRAM *****
    const program = await this.seedHelper.addProgram(programKrcs);

    this.seedHelper.addDefaultUsers(program, true);

    // ***** CREATE INSTANCE *****
    await this.seedHelper.addInstance(instanceKrcs);
  }
}

export default SeedProgramKrcs;
