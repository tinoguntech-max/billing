const { RouterOSClient } = require('routeros-client')

async function test() {
  const client = new RouterOSClient({
    host: '157.15.67.185',
    user: 'tamnet',
    password: 'tino2025',
    port: 9125,
    timeout: 30,
  })

  try {
    await client.connect()
    console.log('✅ Connected!')
    
    console.log('\nGetting system identity...')
    const identity = await client.api('/system/identity/print')
    console.log('Identity response:', JSON.stringify(identity, null, 2))
    
    console.log('\nGetting PPPoE secrets (first 3)...')
    const secrets = await client.api('/ppp/secret/print')
    console.log(`Total secrets: ${secrets.length}`)
    console.log('First secret:', JSON.stringify(secrets[0], null, 2))
    
    await client.close()
    console.log('\n✅ Test completed!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('Stack:', error.stack)
    process.exit(1)
  }
}

test()
