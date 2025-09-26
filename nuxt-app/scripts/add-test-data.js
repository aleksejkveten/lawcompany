import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'
import { scheduledMessagesQueue } from './server/utils/redis'

const prisma = new PrismaClient()

async function addTestData() {
  try {
    console.log('Adding comprehensive test data...')

    // Create channel categories
    const category1 = await prisma.channelCategory.create({
      data: { name: 'Судебные уведомления' }
    })

    const category2 = await prisma.channelCategory.create({
      data: { name: 'Досудебные претензии' }
    })

    const category3 = await prisma.channelCategory.create({
      data: { name: 'Информационные рассылки' }
    })

    // Create SMS templates
    const smsTemplate1 = await prisma.smsTemplate.create({
      data: {
        name: 'Уведомление о долге',
        content: 'Уважаемый клиент! У Вас имеется задолженность перед {claimant} в размере {debtAmount} BYN по делу №{caseNumber}. Просим погасить в кратчайшие сроки.',
        channelCategoryId: category1.id
      }
    })

    const smsTemplate2 = await prisma.smsTemplate.create({
      data: {
        name: 'Претензия по оплате',
        content: 'Добрый день! Напоминаем о необходимости оплаты долга в сумме {debtAmount} BYN в пользу {claimant}. Срок оплаты истекает через 7 дней.',
        channelCategoryId: category2.id
      }
    })

    const smsTemplate3 = await prisma.smsTemplate.create({
      data: {
        name: 'Информационное сообщение',
        content: 'Информация: Ваше дело №{caseNumber} находится на рассмотрении в {courtName}. Сумма иска: {debtAmount} BYN.',
        channelCategoryId: category3.id
      }
    })

    // Create email templates (plain text and HTML)
    const emailTemplate1 = await prisma.emailTemplate.create({
      data: {
        name: 'Судебное уведомление (plain text)',
        subject: 'Уведомление о судебном разбирательстве №{caseNumber}',
        content: `Уважаемый получатель!

Настоящим уведомляем Вас о том, что в {courtName} рассматривается дело №{caseNumber} по иску {claimant} к {debtor}.

Сумма иска: {debtAmount} BYN
Дата поступления: {receiptDate}
Решение суда: {decision}

Просим Вас явиться в суд в назначенное время или предоставить необходимые документы.

С уважением,
Судебный отдел`,
        format: 'plaintext',
        channelCategoryId: category1.id
      }
    })

    const emailTemplate2 = await prisma.emailTemplate.create({
      data: {
        name: 'Претензия по оплате (HTML)',
        subject: 'Претензия: Требование об оплате задолженности',
        content: `<html>
<body>
<h2>ПРЕТЕНЗИЯ</h2>
<p>Уважаемый <strong>{debtor}</strong>!</p>

<p>Настоящей претензией ООО "Альфа Строй" требует от Вас оплаты задолженности в размере <strong>{debtAmount} BYN</strong> по договору поставки строительных материалов.</p>

<p><strong>Детали задолженности:</strong></p>
<ul>
<li>Номер дела: {caseNumber}</li>
<li>Истец: {claimant}</li>
<li>Сумма долга: {debtAmount} BYN</li>
<li>Дата поступления: {receiptDate}</li>
<li>Суд: {courtName}</li>
</ul>

<p>В случае неоплаты в течение 10 дней с момента получения настоящей претензии, ООО "Альфа Строй" будет вынуждено обратиться в суд для защиты своих интересов.</p>

<p>Просим Вас в кратчайшие сроки погасить задолженность и предоставить подтверждение оплаты.</p>

<p>С уважением,<br>
Директор ООО "Альфа Строй"<br>
Иванов И.И.</p>
</body>
</html>`,
        format: 'html',
        channelCategoryId: category2.id
      }
    })

    const emailTemplate3 = await prisma.emailTemplate.create({
      data: {
        name: 'Информационное письмо (plain text)',
        subject: 'Информация о статусе дела №{caseNumber}',
        content: `Уважаемый клиент!

Информируем Вас о текущем статусе Вашего дела:

Номер дела: {caseNumber}
Истец: {claimant}
Ответчик: {debtor}
Сумма иска: {debtAmount} BYN
Суд: {courtName}
Дата поступления: {receiptDate}

Дело находится на стадии рассмотрения. При наличии новых обстоятельств мы свяжемся с Вами дополнительно.

С уважением,
Юридический отдел`,
        format: 'plaintext',
        channelCategoryId: category3.id
      }
    })

    // Create message chains
    const messageChain1 = await prisma.messageChain.create({
      data: {
        name: 'Судебная цепочка уведомлений',
        description: 'Последовательность уведомлений по судебным делам',
        chains: [
          { templateId: smsTemplate1.id, type: 'sms', daysOffset: 0 },
          { templateId: emailTemplate1.id, type: 'email', daysOffset: 1 },
          { templateId: smsTemplate3.id, type: 'sms', daysOffset: 7 }
        ]
      }
    })

    const messageChain2 = await prisma.messageChain.create({
      data: {
        name: 'Досудебная претензия',
        description: 'Претензия перед судебным разбирательством',
        chains: [
          { templateId: emailTemplate2.id, type: 'email', daysOffset: 0 },
          { templateId: smsTemplate2.id, type: 'sms', daysOffset: 3 }
        ]
      }
    })

    const messageChain3 = await prisma.messageChain.create({
      data: {
        name: 'Информационная рассылка',
        description: 'Регулярные информационные сообщения',
        chains: [
          { templateId: emailTemplate3.id, type: 'email', daysOffset: 0 },
          { templateId: smsTemplate3.id, type: 'sms', daysOffset: 14 }
        ]
      }
    })

    // Create task actions
    const taskAction1 = await prisma.taskAction.create({
      data: { name: 'Позвонить' }
    })

    const taskAction2 = await prisma.taskAction.create({
      data: { name: 'Отправить письмо' }
    })

    const taskAction3 = await prisma.taskAction.create({
      data: { name: 'Подготовить документы' }
    })

    // Create test companies with specified contact info
    const testCompany1 = await prisma.company.create({
      data: {
        name: 'ООО "Альфа Строй"',
        unp: '123456789',
        aliases: 'Альфа-Строй, Alpha Build',
        notes: 'Строительная компания с 15-летним опытом работы',
        track: true,
        contactPersons: {
          create: [
            {
              name: 'Иванов Иван Иванович',
              phones: {
                create: [
                  { number: '375296954963' },
                  { number: '+375171234567' }
                ]
              },
              emails: {
                create: [
                  { address: 'aleksejkveten@gmail.com' },
                  { address: 'i.ivanov@company.com' }
                ]
              }
            }
          ]
        }
      },
      include: {
        contactPersons: {
          include: {
            phones: true,
            emails: true
          }
        }
      }
    })

    const testCompany2 = await prisma.company.create({
      data: {
        name: 'ЗАО "БелТехСервис"',
        unp: '987654321',
        notes: 'Техническое обслуживание оборудования',
        track: false,
        contactPersons: {
          create: [
            {
              name: 'Петрова Анна Сергеевна',
              phones: {
                create: [
                  { number: '375296954963' }
                ]
              },
              emails: {
                create: [
                  { address: 'aleksejkveten@gmail.com' }
                ]
              }
            }
          ]
        }
      },
      include: {
        contactPersons: {
          include: {
            phones: true,
            emails: true
          }
        }
      }
    })

    const testCompany3 = await prisma.company.create({
      data: {
        name: 'ИП "ТехноСервис"',
        unp: '555666777',
        notes: 'Индивидуальный предприниматель, ремонт техники',
        track: true,
        contactPersons: {
          create: [
            {
              name: 'Сидоров Петр Михайлович',
              phones: {
                create: [
                  { number: '375296954963' }
                ]
              },
              emails: {
                create: [
                  { address: 'aleksejkveten@gmail.com' }
                ]
              }
            }
          ]
        }
      },
      include: {
        contactPersons: {
          include: {
            phones: true,
            emails: true
          }
        }
      }
    })

    // Create test court cases
    const testCourtCase1 = await prisma.courtCase.create({
      data: {
        uuid: randomUUID(),
        claimant: 'ООО "Альфа Строй"',
        claimantCompanyId: testCompany1.id,
        debtor: 'ЗАО "БелТехСервис"',
        debtorCompanyId: testCompany2.id,
        caseNumber: 'Д-2024-123',
        incomingNumber: 'ВХ-2024-567',
        receiptDate: new Date('2024-01-15'),
        debtAmount: 75000.00,
        decision: 'Заявление принято к рассмотрению. Назначено предварительное слушание на 15.02.2024',
        courtName: 'Минский городской суд',
        notes: 'Спор по поставке строительных материалов. Истец требует взыскания задолженности за поставленные материалы.',
        track: true
      }
    })

    const testCourtCase2 = await prisma.courtCase.create({
      data: {
        uuid: randomUUID(),
        claimant: 'ИП "ТехноСервис"',
        claimantCompanyId: testCompany3.id,
        debtor: 'ООО "Альфа Строй"',
        debtorCompanyId: testCompany1.id,
        caseNumber: 'Д-2024-456',
        incomingNumber: 'ВХ-2024-890',
        receiptDate: new Date('2024-02-01'),
        debtAmount: 25000.00,
        decision: 'Принято к производству. Назначено судебное заседание.',
        courtName: 'Фрунзенский районный суд г. Минска',
        notes: 'Спор по договору подряда на ремонт оборудования.',
        track: true
      }
    })

    const testCourtCase3 = await prisma.courtCase.create({
      data: {
        uuid: randomUUID(),
        claimant: 'ЗАО "БелТехСервис"',
        claimantCompanyId: testCompany2.id,
        debtor: 'ИП "ТехноСервис"',
        debtorCompanyId: testCompany3.id,
        caseNumber: 'Д-2024-789',
        incomingNumber: 'ВХ-2024-111',
        receiptDate: new Date('2024-03-10'),
        debtAmount: 15000.00,
        decision: 'Оставлено без движения. Предоставить дополнительные документы.',
        courtName: 'Ленинский районный суд г. Минска',
        notes: 'Спор по договору поставки запасных частей.',
        track: false
      }
    })

    // Create test user
    const testUser = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        name: 'Администратор',
        password: '$2b$10$dummy.hash.for.test', // dummy hash
        roles: 'admin'
      }
    })

    // Create tasks
    const task1 = await prisma.task.create({
      data: {
        title: 'Позвонить должнику',
        description: 'Связаться с должником для уточнения возможности оплаты долга',
        actionId: taskAction1.id,
        status: 'pending',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
        courtCaseId: testCourtCase1.id,
        companyId: testCompany2.id,
        contactPersonId: testCompany2.contactPersons[0].id,
        phoneId: testCompany2.contactPersons[0].phones[0].id,
        assignedToId: testUser.id,
        notes: 'Должник обещал перезвонить сегодня'
      }
    })

    const task2 = await prisma.task.create({
      data: {
        title: 'Подготовить исковое заявление',
        description: 'Составить и подготовить исковое заявление в суд',
        actionId: taskAction3.id,
        status: 'completed',
        completedAt: new Date(),
        courtCaseId: testCourtCase2.id,
        companyId: testCompany3.id,
        contactPersonId: testCompany3.contactPersons[0].id,
        phoneId: testCompany3.contactPersons[0].phones[0].id,
        assignedToId: testUser.id
      }
    })

    const task3 = await prisma.task.create({
      data: {
        title: 'Отправить претензию',
        description: 'Отправить досудебную претензию заказным письмом',
        actionId: taskAction2.id,
        status: 'pending',
        scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        courtCaseId: testCourtCase3.id,
        companyId: testCompany3.id,
        contactPersonId: testCompany3.contactPersons[0].id,
        phoneId: testCompany3.contactPersons[0].phones[0].id,
        assignedToId: testUser.id,
        notes: 'Претензия подготовлена, ожидает отправки'
      }
    })

    // Add Redis queue jobs for testing
    console.log('Adding Redis queue jobs...')
    try {
      // SMS job - immediate
      const smsJob1 = await scheduledMessagesQueue.add(
        'send-sms',
        {
          type: 'sms',
          templateId: smsTemplate1.id,
          companyId: testCompany2.id,
          scheduledAt: new Date(Date.now() + 1000), // 1 second from now
          channel: 'smsby'
        },
        {
          delay: 1000,
          jobId: `test-sms-${Date.now()}-1`
        }
      )

      // Email job - 5 minutes from now
      const emailJob1 = await scheduledMessagesQueue.add(
        'send-email',
        {
          type: 'email',
          templateId: emailTemplate2.id,
          companyId: testCompany1.id,
          scheduledAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
          channel: 'smsby'
        },
        {
          delay: 5 * 60 * 1000,
          jobId: `test-email-${Date.now()}-1`
        }
      )

      // SMS job - 10 minutes from now
      const smsJob2 = await scheduledMessagesQueue.add(
        'send-sms',
        {
          type: 'sms',
          templateId: smsTemplate2.id,
          companyId: testCompany3.id,
          scheduledAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
          channel: 'smsby'
        },
        {
          delay: 10 * 60 * 1000,
          jobId: `test-sms-${Date.now()}-2`
        }
      )

      // Email job - 15 minutes from now
      const emailJob2 = await scheduledMessagesQueue.add(
        'send-email',
        {
          type: 'email',
          templateId: emailTemplate3.id,
          companyId: testCompany2.id,
          scheduledAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
          channel: 'smsby'
        },
        {
          delay: 15 * 60 * 1000,
          jobId: `test-email-${Date.now()}-2`
        }
      )

      // SMS job - 30 minutes from now
      const smsJob3 = await scheduledMessagesQueue.add(
        'send-sms',
        {
          type: 'sms',
          templateId: smsTemplate3.id,
          companyId: testCompany1.id,
          scheduledAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
          channel: 'smsby'
        },
        {
          delay: 30 * 60 * 1000,
          jobId: `test-sms-${Date.now()}-3`
        }
      )

      console.log('Redis Queue Jobs:', smsJob1.id, emailJob1.id, smsJob2.id, emailJob2.id, smsJob3.id)
    } catch (redisError) {
      console.error('Error adding Redis jobs:', redisError.message)
      console.log('Database data added successfully, but Redis jobs failed. Check Redis configuration.')
    }

    console.log('Comprehensive test data added successfully!')
    console.log('Channel Categories:', category1.name, category2.name, category3.name)
    console.log('SMS Templates:', smsTemplate1.name, smsTemplate2.name, smsTemplate3.name)
    console.log('Email Templates:', emailTemplate1.name, emailTemplate2.name, emailTemplate3.name)
    console.log('Message Chains:', messageChain1.name, messageChain2.name, messageChain3.name)
    console.log('Task Actions:', taskAction1.name, taskAction2.name, taskAction3.name)
    console.log('Companies:', testCompany1.name, testCompany2.name, testCompany3.name)
    console.log('Court Cases:', testCourtCase1.caseNumber, testCourtCase2.caseNumber, testCourtCase3.caseNumber)
    console.log('Tasks:', task1.title, task2.title, task3.title)
    console.log('Redis Queue Jobs:', smsJob1.id, emailJob1.id, smsJob2.id, emailJob2.id, smsJob3.id)

  } catch (error) {
    console.error('Error adding test data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addTestData()
