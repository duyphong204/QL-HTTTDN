import { Prisma } from '@prisma/client';
import { PaginationQueryDto } from '../dto/pagination-query.dto';

type PrismaModel<T> = {
  findMany: (args: any) => Promise<T[]>;
  count: (args?: any) => Promise<number>;
};

export async function prismaPaginate<T>(
  model: PrismaModel<T>,
  query: PaginationQueryDto,
  options: {
    where?: Prisma.Enumerable<any>;
    include?: Prisma.Enumerable<any>;
    searchFields?: string[];
  } = {},
) {
  const { page = 1, limit = 10, search, sortBy = 'id', order = 'desc' } = query;

  const skip = (page - 1) * limit;

  let where: any = {
    ...options.where,
  };

  // search logic
  if (search && options.searchFields?.length) {
    const searchConditions = options.searchFields.map((field) => ({
      [field]: {
        contains: search,
        mode: 'insensitive',
      },
    }));

    where = {
      ...where,
      OR: searchConditions,
    };
  }

  const orderBy = sortBy
    ? {
        [sortBy]: order,
      }
    : undefined;

  const [items, total] = await Promise.all([
    model.findMany({
      skip,
      take: limit,
      where,
      orderBy,
      include: options.include,
    }),
    model.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      totalsizeInPage: total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
