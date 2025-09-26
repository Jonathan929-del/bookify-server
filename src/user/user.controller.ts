import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}




// "scripts": {
//   "build": "tsc -p tsconfig.build.json",
//   "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
//   "start": "node dist/main.js",
//   "start:dev": "nest start --watch",
//   "start:debug": "nest start --debug --watch",
//   "start:prod": "node dist/main.js",
//   "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
//   "test": "jest",
//   "test:watch": "jest --watch",
//   "test:cov": "jest --coverage",
//   "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
//   "test:e2e": "jest --config ./test/jest-e2e.json"
// }
