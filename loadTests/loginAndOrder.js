import { sleep, check, group, fail } from 'k6'
import http from 'k6/http'
import jsonpath from 'https://jslib.k6.io/jsonpath/1.0.2/index.js'

export const options = {
  cloud: {
    distribution: { 'amazon:us:ashburn': { loadZone: 'amazon:us:ashburn', percent: 100 } },
    apm: [],
  },
  thresholds: {},
  scenarios: {
    Scenario_1: {
      executor: 'ramping-vus',
      gracefulStop: '30s',
      stages: [
        { target: 5, duration: '30s' },
        { target: 15, duration: '1m' },
        { target: 10, duration: '30s' },
        { target: 0, duration: '30s' },
      ],
      gracefulRampDown: '30s',
      exec: 'scenario_1',
    },
    Imported_HAR: {
      executor: 'ramping-vus',
      gracefulStop: '30s',
      stages: [
        { target: 20, duration: '1m' },
        { target: 20, duration: '3m30s' },
        { target: 0, duration: '1m' },
      ],
      gracefulRampDown: '30s',
      exec: 'imported_HAR',
    },
    Imported_HAR1: {
      executor: 'ramping-vus',
      gracefulStop: '30s',
      stages: [
        { target: 20, duration: '1m' },
        { target: 20, duration: '3m30s' },
        { target: 0, duration: '1m' },
      ],
      gracefulRampDown: '30s',
      exec: 'imported_HAR1',
    },
  },
}

// Scenario: Scenario_1 (executor: ramping-vus)

export function scenario_1() {
  let response

  // Automatically added sleep
  sleep(1)
}

// Scenario: Imported_HAR (executor: ramping-vus)

export function imported_HAR() {
  let response

  const vars = {}

  group('page_1 - https://pizza.eatandtravel.click/login', function () {
    response = http.get('https://pizza.eatandtravel.click/login', {
      headers: {
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
        'cache-control': 'max-age=0',
        priority: 'u=0, i',
        'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
      },
    })
    sleep(24.3)

    response = http.put(
      'https://api.pizza.eatandtravel.click/api/auth',
      '{"email":"blaccbaron@gmail.com","password":"2637221KUku@1966"}',
      {
        headers: {
          accept: '*/*',
          'accept-encoding': 'gzip, deflate, br, zstd',
          'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
          'content-type': 'application/json',
          origin: 'https://pizza.eatandtravel.click',
          priority: 'u=1, i',
          'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-site',
        },
      }
    )
    if (!check(response, { 'login status is 200': r => r.status === 200 })) {
      console.log('Login failed:', response.body)
      fail('Login request failed')
      }

    vars['token1'] = jsonpath.query(response.json(), '$.token')[0]

    response = http.options('https://api.pizza.eatandtravel.click/api/auth', null, {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
        'access-control-request-headers': 'content-type',
        'access-control-request-method': 'PUT',
        origin: 'https://pizza.eatandtravel.click',
        priority: 'u=1, i',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
      },
    })
    sleep(6.5)

    response = http.get('https://api.pizza.eatandtravel.click/api/order/menu', {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
        authorization: `Bearer ${vars['token1']}`,
        'content-type': 'application/json',
        origin: 'https://pizza.eatandtravel.click',
        priority: 'u=1, i',
        'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
      },
    })

    response = http.options('https://api.pizza.eatandtravel.click/api/order/menu', null, {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
        'access-control-request-headers': 'authorization,content-type',
        'access-control-request-method': 'GET',
        origin: 'https://pizza.eatandtravel.click',
        priority: 'u=1, i',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
      },
    })

    response = http.get(
      'https://api.pizza.eatandtravel.click/api/franchise?page=0&limit=20&name=*',
      {
        headers: {
          accept: '*/*',
          'accept-encoding': 'gzip, deflate, br, zstd',
          'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
          authorization: `Bearer ${vars['token1']}`,
          'content-type': 'application/json',
          origin: 'https://pizza.eatandtravel.click',
          priority: 'u=1, i',
          'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-site',
        },
      }
    )

    response = http.options(
      'https://api.pizza.eatandtravel.click/api/franchise?page=0&limit=20&name=*',
      null,
      {
        headers: {
          accept: '*/*',
          'accept-encoding': 'gzip, deflate, br, zstd',
          'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
          'access-control-request-headers': 'authorization,content-type',
          'access-control-request-method': 'GET',
          origin: 'https://pizza.eatandtravel.click',
          priority: 'u=1, i',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-site',
        },
      }
    )
    sleep(8.6)

    response = http.get('https://api.pizza.eatandtravel.click/api/user/me', {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
        authorization: `Bearer ${vars['token1']}`,
        'content-type': 'application/json',
        'if-none-match': 'W/"62-S0blLMZF+42skAS3Y0LqBST/YZM"',
        origin: 'https://pizza.eatandtravel.click',
        priority: 'u=1, i',
        'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
      },
    })

    response = http.options('https://api.pizza.eatandtravel.click/api/user/me', null, {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
        'access-control-request-headers': 'authorization,content-type',
        'access-control-request-method': 'GET',
        origin: 'https://pizza.eatandtravel.click',
        priority: 'u=1, i',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
      },
    })
    sleep(3.5)

    response = http.post(
      'https://api.pizza.eatandtravel.click/api/order',
      '{"items":[{"menuId":1,"description":"Veggie","price":0.0038}],"storeId":"1","franchiseId":1}',
      {
        headers: {
          accept: '*/*',
          'accept-encoding': 'gzip, deflate, br, zstd',
          'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
          authorization: `Bearer ${vars['token1']}`,
          'content-type': 'application/json',
          origin: 'https://pizza.eatandtravel.click',
          priority: 'u=1, i',
          'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-site',
        },
      }
    )
    if (!check(response, { 'order status is 200': r => r.status === 200 })) {
      console.log('Order failed:', response.body)
      fail('Order request failed')
      }

    response = http.options('https://api.pizza.eatandtravel.click/api/order', null, {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
        'access-control-request-headers': 'authorization,content-type',
        'access-control-request-method': 'POST',
        origin: 'https://pizza.eatandtravel.click',
        priority: 'u=1, i',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
      },
    })
    sleep(4)

    response = http.post(
      'https://pizza-factory.cs329.click/api/order/verify',
      '{"jwt":"eyJpYXQiOjE3NjM5ODkzMzIsImV4cCI6MTc2NDA3NTczMiwiaXNzIjoiY3MzMjkuY2xpY2siLCJhbGciOiJSUzI1NiIsImtpZCI6IjE0bk5YT21jaWt6emlWZWNIcWE1UmMzOENPM1BVSmJuT2MzazJJdEtDZlEifQ.eyJ2ZW5kb3IiOnsiaWQiOiJiYXNoaXJvdiIsIm5hbWUiOiJBbXVyIEJhc2hpcm92In0sImRpbmVyIjp7ImlkIjoxMiwibmFtZSI6ImFtdXIiLCJlbWFpbCI6ImJsYWNjYmFyb25AZ21haWwuY29tIn0sIm9yZGVyIjp7Iml0ZW1zIjpbeyJtZW51SWQiOjEsImRlc2NyaXB0aW9uIjoiVmVnZ2llIiwicHJpY2UiOjAuMDAzOH1dLCJzdG9yZUlkIjoiMSIsImZyYW5jaGlzZUlkIjoxLCJpZCI6NH19.RAkHsCPutrtIL8bJ1q7MgjuGaTIRmZQemg1J3daBnep59SxK_1JH7CiWJ8vLxHq0kss66EOK8SKVDRC7oEcdUGCXF7vHWoJwj4siuJF5aSsqHGV1ayDqOSrzx_BB2YIGfNQvRjpMmvujoRcEcsBkvu873WxF44pxi0Mixlgju2iUmDlBC5ix3xAEpgfT7W-1QM9PLyvJ0mVOae4N_2SwKjdsJAH3InuCZHEJvP52iNXNPzzeRquQoQ7xdpb0gBB6iUCXuh7016D2RhTiV1dsG_RdCUMy5q-MnZqK9A_GwErKE44oODcnwCKLHE8p2nhzKkH0XsjkEonLU592c0UCeYavYoiQkx_ppjE_S3ABLWGqEuccJG6VZWndv8noOfNh0Pnk6ry2z2sQxBcNQkc4AfR5eWS3SnWB0-f6ttE_lFhMNuxpVaxRKOFZHPfQmc8HnPwOHXRrdgcfbfZb4v0GQebTX8b9WzzYuP1FIx5CtFy-DdYFn1f6f0WJM8AOR7anm70C95HWv6D5_Rcu65V4vc_XIj5bPWDHDX0Sci5S0RgOG0-rBBXHpI0tYzvGO2kdmCR9-VGsJhDrlRSZV2G2rDpD6QgpiHfHJHFiXC_RUNaemRmT6he5jIdTDmV0fCIyMXBVSqphUAOUfbInxxkynY4FCuDqzmCGGTTFWeRHzlk"}',
      {
        headers: {
          accept: '*/*',
          'accept-encoding': 'gzip, deflate, br, zstd',
          'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
          authorization: `Bearer ${vars['token1']}`,
          'content-type': 'application/json',
          origin: 'https://pizza.eatandtravel.click',
          priority: 'u=1, i',
          'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'cross-site',
          'sec-fetch-storage-access': 'active',
        },
      }
    )

    response = http.post(
      'https://pizza-factory.cs329.click/api/order/verify',
      JSON.stringify({ jwt: vars['token1'] }),  // dynamically using the login token
      {
        headers: {
          accept: '*/*',
          'content-type': 'application/json',
          authorization: `Bearer ${vars['token1']}`,
        }
      }
    )

  })
}

// Scenario: Imported_HAR1 (executor: ramping-vus)

export function imported_HAR1() {
  let response

  const vars = {}

  group('page_1 - https://pizza.eatandtravel.click/login', function () {
    response = http.get('https://pizza.eatandtravel.click/login', {
      headers: {
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
        'cache-control': 'max-age=0',
        priority: 'u=0, i',
        'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
      },
    })
    sleep(24.3)

    response = http.put(
      'https://api.pizza.eatandtravel.click/api/auth',
      '{"email":"blaccbaron@gmail.com","password":"2637221KUku@1966"}',
      {
        headers: {
          accept: '*/*',
          'accept-encoding': 'gzip, deflate, br, zstd',
          'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
          'content-type': 'application/json',
          origin: 'https://pizza.eatandtravel.click',
          priority: 'u=1, i',
          'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-site',
        },
      }
    )
    if (!check(response, { 'status equals 200': response => response.status.toString() === '200' })) {
    console.log(response.body);
    fail('Login was *not* 200');
  }

    vars['token1'] = jsonpath.query(response.json(), '$.token')[0]

    response = http.options('https://api.pizza.eatandtravel.click/api/auth', null, {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
        'access-control-request-headers': 'content-type',
        'access-control-request-method': 'PUT',
        origin: 'https://pizza.eatandtravel.click',
        priority: 'u=1, i',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
      },
    })
    sleep(6.5)

    response = http.get('https://api.pizza.eatandtravel.click/api/order/menu', {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
        authorization: `Bearer ${vars['token1']}`,
        'content-type': 'application/json',
        origin: 'https://pizza.eatandtravel.click',
        priority: 'u=1, i',
        'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
      },
    })

    response = http.options('https://api.pizza.eatandtravel.click/api/order/menu', null, {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
        'access-control-request-headers': 'authorization,content-type',
        'access-control-request-method': 'GET',
        origin: 'https://pizza.eatandtravel.click',
        priority: 'u=1, i',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
      },
    })

    response = http.get(
      'https://api.pizza.eatandtravel.click/api/franchise?page=0&limit=20&name=*',
      {
        headers: {
          accept: '*/*',
          'accept-encoding': 'gzip, deflate, br, zstd',
          'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
          authorization: `Bearer ${vars['token1']}`,
          'content-type': 'application/json',
          origin: 'https://pizza.eatandtravel.click',
          priority: 'u=1, i',
          'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-site',
        },
      }
    )

    response = http.options(
      'https://api.pizza.eatandtravel.click/api/franchise?page=0&limit=20&name=*',
      null,
      {
        headers: {
          accept: '*/*',
          'accept-encoding': 'gzip, deflate, br, zstd',
          'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
          'access-control-request-headers': 'authorization,content-type',
          'access-control-request-method': 'GET',
          origin: 'https://pizza.eatandtravel.click',
          priority: 'u=1, i',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-site',
        },
      }
    )
    sleep(8.6)

    response = http.get('https://api.pizza.eatandtravel.click/api/user/me', {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
        authorization: `Bearer ${vars['token1']}`,
        'content-type': 'application/json',
        'if-none-match': 'W/"62-S0blLMZF+42skAS3Y0LqBST/YZM"',
        origin: 'https://pizza.eatandtravel.click',
        priority: 'u=1, i',
        'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
      },
    })

    response = http.options('https://api.pizza.eatandtravel.click/api/user/me', null, {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
        'access-control-request-headers': 'authorization,content-type',
        'access-control-request-method': 'GET',
        origin: 'https://pizza.eatandtravel.click',
        priority: 'u=1, i',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
      },
    })
    sleep(3.5)

    response = http.post(
      'https://api.pizza.eatandtravel.click/api/order',
      '{"items":[{"menuId":1,"description":"Veggie","price":0.0038}],"storeId":"1","franchiseId":1}',
      {
        headers: {
          accept: '*/*',
          'accept-encoding': 'gzip, deflate, br, zstd',
          'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
          authorization: `Bearer ${vars['token1']}`,
          'content-type': 'application/json',
          origin: 'https://pizza.eatandtravel.click',
          priority: 'u=1, i',
          'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-site',
        },
      }
    )

    response = http.options('https://api.pizza.eatandtravel.click/api/order', null, {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
        'access-control-request-headers': 'authorization,content-type',
        'access-control-request-method': 'POST',
        origin: 'https://pizza.eatandtravel.click',
        priority: 'u=1, i',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
      },
    })
    if (!check(response, { 'order status is 200': r => r.status === 200 })) {
      console.log('Order failed:', response.body)
      fail('Order request failed')
      }
    sleep(4)

    response = http.post(
      'https://pizza-factory.cs329.click/api/order/verify',
      JSON.stringify({ jwt: vars['token1'] }),  // dynamically using the login token
      {
        headers: {
          accept: '*/*',
          'content-type': 'application/json',
          authorization: `Bearer ${vars['token1']}`,
        }
      }
    )


    response = http.options('https://pizza-factory.cs329.click/api/order/verify', null, {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
        'access-control-request-headers': 'authorization,content-type',
        'access-control-request-method': 'POST',
        origin: 'https://pizza.eatandtravel.click',
        priority: 'u=1, i',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
      },
    })
  })
}