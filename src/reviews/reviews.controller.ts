import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UserRole } from '../entities/user.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Public()
  @Get('product/:productId')
  @ApiOperation({ summary: 'Get reviews by product' })
  findByProduct(
    @Param('productId') productId: string,
    @Query() query: PaginationDto,
  ) {
    return this.reviewsService.findByProduct(
      productId,
      query.page,
      query.limit,
    );
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all reviews (Admin)' })
  findAll(@Query() query: PaginationDto) {
    return this.reviewsService.findAll(query.page, query.limit);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a review' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(userId, dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a review' })
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a review' })
  delete(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.reviewsService.delete(userId, id);
  }

  @Patch(':id/approve')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve a review (Admin)' })
  approve(@Param('id') id: string) {
    return this.reviewsService.approve(id);
  }

  @Patch(':id/hide')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hide a review (Admin)' })
  hide(@Param('id') id: string) {
    return this.reviewsService.hide(id);
  }
}
