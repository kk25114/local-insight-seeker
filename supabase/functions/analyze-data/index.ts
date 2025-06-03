
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, model_id, provider, api_key_name } = await req.json()

    // 创建 Supabase 客户端来获取 API 密钥
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // 从 Supabase secrets 获取 API 密钥
    const apiKey = Deno.env.get(api_key_name)
    if (!apiKey) {
      throw new Error(`API密钥 ${api_key_name} 未配置`)
    }

    console.log(`使用 ${provider} 提供商的 ${model_id} 模型进行分析`)

    let response
    let result

    if (provider === 'openai') {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model_id,
          messages: [
            {
              role: 'system',
              content: '你是一个专业的统计分析师，擅长使用SPSS和其他统计软件进行数据分析。请提供详细、准确的统计分析结果。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`OpenAI API 错误: ${response.status} - ${errorText}`)
      }

      result = await response.json()
      return new Response(
        JSON.stringify({ content: result.choices[0]?.message?.content || '分析完成但未收到结果' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else if (provider === 'anthropic') {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: model_id,
          max_tokens: 2000,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Anthropic API 错误: ${response.status} - ${errorText}`)
      }

      result = await response.json()
      return new Response(
        JSON.stringify({ content: result.content[0]?.text || '分析完成但未收到结果' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else if (provider === 'xai') {
      // 直接使用 grok-3-fast 模型
      response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model_id, // 直接使用传入的 model_id
          messages: [
            {
              role: 'system',
              content: '你是一个专业的统计分析师和AI助手，擅长使用SPSS和其他统计软件进行数据分析。请提供详细、准确且易于理解的分析结果和建议。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`xAI API 错误: ${response.status} - ${errorText}`)
        throw new Error(`xAI API 错误: ${response.status} - ${errorText}`)
      }

      result = await response.json()
      return new Response(
        JSON.stringify({ content: result.choices[0]?.message?.content || '分析完成但未收到结果' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      throw new Error(`不支持的AI提供商: ${provider}`)
    }

  } catch (error) {
    console.error('分析错误:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
