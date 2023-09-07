import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { db } from '../database'
import { checkSessionIdExists } from '../middlaweres/check-session-id-exists'

export async function transactionsRoutes(app: FastifyInstance) {
    app.get('/', {
        preHandler: [checkSessionIdExists]
    }, async (request) => {

        const { sessionId } = request.cookies

        console.log(sessionId)

        const transactions = await db('transactions')
            .where('session_id', sessionId)
            .select()

        return {
            transactions
        }
    })

    app.get('/:id', {
        preHandler: [checkSessionIdExists]
    }, async (request) => {

        const { sessionId } = request.cookies

        const getTransactionParamsSchema = z.object({
            id: z.string().uuid(),
        })
        const { id } = getTransactionParamsSchema.parse(request.params)
        const transaction = await db('transactions').where({ 'session_id': sessionId, id }).first()

        return { transaction }

    })

    app.get('/summary', {
        preHandler: [checkSessionIdExists]
    }, async (request) => {
        const { sessionId } = request.cookies


        const summary = await db('transactions').sum('amount', { as: 'amout' }).where('session_id', sessionId).first()
        return { summary }
    })


    app.post('/', async (request, reply) => {
        const createTransactionBodySchema = z.object({
            title: z.string(),
            amount: z.number(),
            type: z.enum(['credit', 'debit'])
        })
        const { title, amount, type } = createTransactionBodySchema.parse(request.body)
        let sessionId = request.cookies.sessionId
        const maxAge7Days = 1000 * 60 * 60 * 24 * 7

        if (!sessionId) {
            sessionId = randomUUID()

            reply.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: maxAge7Days
            })
        }

        await db('transactions').insert({
            id: randomUUID(),
            title,
            amount: type == 'credit' ? amount : amount * -1,
            session_id: sessionId
        })

        return reply.status(201).send('Transacao Criada')
    })
}