import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addTaskTestData() {
  try {
    console.log('Adding task test data...')

    // Create task actions
    const callAction = await prisma.taskAction.create({
      data: {
        name: 'call'
      }
    })

    const writeAction = await prisma.taskAction.create({
      data: {
        name: 'write'
      }
    })

    console.log('Task actions created:', callAction.name, writeAction.name)

    // Get existing data
    const companies = await prisma.company.findMany({
      include: {
        contactPersons: {
          include: {
            phones: true
          }
        }
      },
      take: 2
    })

    if (companies.length < 2) {
      console.log('Not enough companies found. Please run add-test-data.js first.')
      return
    }

    const users = await prisma.user.findMany({
      take: 1
    })

    if (users.length === 0) {
      console.log('No users found. Please create a user first.')
      return
    }

    const company1 = companies[0]
    const company2 = companies[1]
    const user = users[0]

    // Create test tasks
    const task1 = await prisma.task.create({
      data: {
        title: 'Позвонить по поводу долга',
        description: 'Связаться с должником для уточнения статуса оплаты',
        actionId: callAction.id,
        status: 'pending',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        companyId: company1.id,
        contactPersonId: company1.contactPersons[0].id,
        phoneId: company1.contactPersons[0].phones[0].id,
        assignedToId: user.id,
        notes: 'Важно связаться до конца недели'
      }
    })

    const task2 = await prisma.task.create({
      data: {
        title: 'Отправить письмо с требованием',
        description: 'Подготовить и отправить официальное письмо',
        actionId: writeAction.id,
        status: 'pending',
        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        companyId: company2.id,
        contactPersonId: company2.contactPersons[0].id,
        phoneId: company2.contactPersons[0].phones[0].id,
        assignedToId: user.id,
        notes: 'Использовать шаблон официального письма'
      }
    })

    const task3 = await prisma.task.create({
      data: {
        title: 'Завершенная задача',
        description: 'Эта задача уже выполнена',
        actionId: callAction.id,
        status: 'completed',
        scheduledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        companyId: company1.id,
        contactPersonId: company1.contactPersons[0].id,
        phoneId: company1.contactPersons[0].phones[0].id,
        assignedToId: user.id,
        notes: 'Задача выполнена успешно'
      }
    })

    console.log('Test tasks created:')
    console.log('Task 1:', task1.title, '- ID:', task1.id)
    console.log('Task 2:', task2.title, '- ID:', task2.id)
    console.log('Task 3 (completed):', task3.title, '- ID:', task3.id)

  } catch (error) {
    console.error('Error adding task test data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addTaskTestData()
