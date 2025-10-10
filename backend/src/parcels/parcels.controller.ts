import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { ParcelsService } from './parcels.service';
import { CreateParcelDto } from './dto/create-parcel.dto';
import { UpdateParcelStatusDto } from './dto/update-parcel-status.dto';
import { SearchParcelsDto } from './dto/search-parcels.dto';
import { AcceptParcelDto } from './dto/accept-parcel.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../entities/user.entity';

@Controller('parcels')
@UseGuards(JwtAuthGuard)
export class ParcelsController {
  constructor(private readonly parcelsService: ParcelsService) {}

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() createParcelDto: CreateParcelDto,
  ) {
    return this.parcelsService.create(user.id, createParcelDto);
  }

  @Get()
  async findAll(@Query() searchDto: SearchParcelsDto) {
    return this.parcelsService.findAll(searchDto);
  }

  @Get('my-parcels')
  async findMyParcels(@CurrentUser() user: User) {
    return this.parcelsService.findByUser(user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.parcelsService.findById(id);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() updateStatusDto: UpdateParcelStatusDto,
  ) {
    return this.parcelsService.updateStatus(id, user.id, updateStatusDto);
  }

  @Post(':id/accept')
  async acceptParcel(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() acceptParcelDto: AcceptParcelDto,
  ) {
    return this.parcelsService.acceptParcel(
      id,
      user.id,
      acceptParcelDto.tripId,
    );
  }

  @Delete(':id')
  async cancelParcel(@Param('id') id: string, @CurrentUser() user: User) {
    return this.parcelsService.cancelParcel(id, user.id);
  }
}

