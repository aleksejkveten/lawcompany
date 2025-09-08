import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

async function addTestData() {
  try {
    console.log('Adding test data...')

    // Create test companies
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
                  { number: '+375291234567' },
                  { number: '+375171234567' }
                ]
              },
              emails: {
                create: [
                  { address: 'ivanov@alfastroy.by' },
                  { address: 'i.ivanov@company.com' }
                ]
              }
            }
          ]
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
                  { number: '+375331112233' }
                ]
              },
              emails: {
                create: [
                  { address: 'petrova@beltech.by' }
                ]
              }
            }
          ]
        }
      }
    })

    // Create test court case
    const testCourtCase = await prisma.courtCase.create({
      data: {
        uuid: randomUUID(),
        claimant: 'ООО "Альфа Строй"',
        claimantCompanyId: testCompany1.id,
        debtor: 'ЗАО "БелТехСервис"',
        debtorCompanyId: testCompany2.id,
        registrationNumber: 'REG-2024-001',
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

    console.log('Test data added successfully!')
    console.log('Company 1:', testCompany1.name, '- ID:', testCompany1.id)
    console.log('Company 2:', testCompany2.name, '- ID:', testCompany2.id)
    console.log('Court Case:', testCourtCase.caseNumber, '- ID:', testCourtCase.id)

  } catch (error) {
    console.error('Error adding test data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addTestData()