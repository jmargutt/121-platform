import { SeedMultiProgram } from './seed-multi-program';
import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiModelProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Connection } from 'typeorm';
import { SeedPilotNLProgram } from './seed-program-pilot-nl';

class ResetDto {
  @ApiModelProperty({ example: 'fill_in_secret' })
  @IsNotEmpty()
  @IsString()
  public readonly secret: string;
  @ApiModelProperty({ example: 'demo / pilot-nl / single' })
  public readonly script: string;
}

@Controller('scripts')
export class ScriptsController {
  public constructor(private connection: Connection) {}

  @ApiOperation({ title: 'Reset database' })
  @Post('/reset')
  public async resetDb(@Body() body: ResetDto, @Res() res): Promise<string> {
    if (body.secret !== process.env.RESET_SECRET) {
      return res.status(HttpStatus.FORBIDDEN).send('Not allowed');
    }
    let seed;
    if (body.script == 'demo') {
      seed = new SeedDemoProgram(this.connection);
    } else if (body.script == 'pilot-nl') {
      seed = new SeedPilotNLProgram(this.connection);
    } else {
      seed = new SeedSingleProgram(this.connection);
    }
    await seed.run();
    return res
      .status(HttpStatus.ACCEPTED)
      .send('Request received. The reset can take a minute.');
  }
}
