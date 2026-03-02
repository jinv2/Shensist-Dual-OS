exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

    try {
        const { zx_id, intent, apiKey, model } = JSON.parse(event.body);

        if (!apiKey) {
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ result: "🔴 拒绝访问：客户未提供算力凭证(API Key)，神思隐擎拒绝白嫖。" })
            };
        }

        const tools = [{
            "function_declarations": [{
                "name": "generate_sora2_video_prompts",
                "description": "当意图中包含视频、SORA2、山海经等视觉化需求时调用。自动生成包含重黎、青黛、马龙等核心角色的专业分镜。",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "theme": { "type": "string", "description": "视频核心冲突" },
                        "roles": { "type": "string", "description": "出场角色" }
                    },
                    "required": ["theme"]
                }
            }]
        }];

        const systemInstruction = "你是神思庭后台的无脸调度器。阅读工具库，匹配则调用工具，不匹配则拒绝。绝不进行人类对话。";
        
        const payload = {
            system_instruction: { parts: [{ text: systemInstruction }] },
            contents: [{ parts: [{ text: intent }] }],
            tools: tools,
            tool_config: { function_calling_config: { mode: "AUTO" } }
        };

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const llmData = await response.json();
        let finalProduct = "";
        const parts = llmData.candidates?.[0]?.content?.parts || [];
        const functionCall = parts.find(p => p.functionCall);

        if (functionCall && functionCall.functionCall.name === "generate_sora2_video_prompts") {
            const args = functionCall.functionCall.args;
            finalProduct = `【神思隐擎 LATT 交付成品】\n`;
            finalProduct += `📜 剧本主线：${args.theme}\n\n`;
            finalProduct += `🎬 镜头 1: （深渊对峙）[男主] @mmmmmmmm1r 拔出巨剑，直指前方，[恶霸] @mmmmmmmm1.ironviperh 露出狰狞冷笑。\n`;
            finalProduct += `🎬 镜头 2: （幻象降临）[九尾狐] @mmmmmmmm1.foxqueenah 从暗影中浮现，九尾遮蔽天日；[小青蛇精] @mmmmmmmm1.verdantnam 在毒雾中游走。\n`;
            finalProduct += `🎬 镜头 3: （神力碰撞）[马龙] @mmmmmmmm1.luminara_d 破云而出，雷电交加，[女主] @christinamontoya 闭目施展守护结界。`;
        } else {
            finalProduct = "⚖️ 隐擎评估：该宏观意志未触发后台现有的视频生产力工具。";
        }

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
            body: JSON.stringify({ result: finalProduct })
        };

    } catch (error) {
        return { statusCode: 500, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ result: `🔴 隐擎 API 路由故障: ${error.message}` }) };
    }
};
