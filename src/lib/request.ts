/**
 * Created by ChengZheLin on 2019/8/7.
 * Features:
 */

import request from 'request-promise-native'
import _ from 'lodash'

interface Params {
    uri: string
    method: string
    headers?: object
    form?: object
    formData?: object
    body?: string
    opsJson?: boolean | undefined
    opsMobile?: boolean | undefined
}

function userAgentGenerate (mobile?: boolean | undefined) {
    const ua = {
        m: [
            'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
            'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Mobile Safari/537.36',
            'Mozilla/5.0 (Linux; Android 8.0.0; Pixel 2 XL Build/OPD1.170816.004) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Mobile Safari/537.36',
        ],
        p: [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36',
            'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; QQDownload 732; .NET4.0C; .NET4.0E)',
            'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.101 Safari/537.36'
        ]
    }

    return ua[mobile ? 'm' : 'p'][_.random(0, 2)]
}

export default async function (params: Params): Promise<void | string | object> {
    try {
        return await request({
            ...params,
            timeout: 10000,
            resolveWithFullResponse: true,
            json: params.opsJson,
            headers: {
                ...params.headers,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'zh-CN,zh;q=0.9,zh-TW;q=0.8,ko;q=0.7',
                'Connection': 'keep-alive',
                'User-Agent': userAgentGenerate(params.opsMobile)
            }
        })
    } catch (e) {
        console.error(e)
    }
}
