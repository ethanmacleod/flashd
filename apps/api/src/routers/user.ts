import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { db } from '../lib/db'
import { publicProcedure, router } from '../trpc/utils'

export const userRouter = router({
  getCustomColors: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' })
    return await db.customColor.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: 'desc' },
    })
  }),

  saveCustomColor: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(50),
        value: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' })
      return await db.customColor.create({
        data: {
          name: input.name,
          value: input.value,
          userId: ctx.user.id,
        },
      })
    }),

  deleteCustomColor: publicProcedure
    .input(
      z.object({
        colorId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' })
      const color = await db.customColor.findFirst({
        where: {
          id: input.colorId,
          userId: ctx.user.id,
        },
      })

      if (!color) {
        throw new Error('Color not found or not owned by user')
      }

      return await db.customColor.delete({
        where: { id: input.colorId },
      })
    }),
})
