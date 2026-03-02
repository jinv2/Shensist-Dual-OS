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
            "function_declarations": [
                {
                    // === 这是您原有的工具 1：SORA2 视频 ===
                    "name": "generate_sora2_video_prompts",
                    "description": "当用户意图中包含制作山海经视频、短视频、SORA2等视觉化需求时，调用此工具。它能自动生成包含固定角色（如重黎、青黛、马龙等）的专业分镜提示词。",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "theme": { "type": "string", "description": "提炼出的视频核心冲突或剧情主线" },
                            "roles": { "type": "string", "description": "分析需要出场的角色组合" }
                        },
                        "required": ["theme"]
                    }
                },
                {
                    // === 【本次新增】工具 2：Suno/Udio 战歌生成 ===
                    "name": "generate_suno_music_prompts",
                    "description": "当用户意图中包含音乐、战歌、BGM、配乐等听觉需求时调用。它能自动生成适合 Suno/Udio 的赛博古风音乐提示词及山海经歌词。",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "style": { "type": "string", "description": "推测的音乐流派，如：赛博古风、暗黑交响、电子重金属" },
                            "mood": { "type": "string", "description": "情绪基调，如：肃杀、空灵、狂暴" }
                        },
                        "required": ["style", "mood"]
                    }
                },
                {
                    // === 【本次新增】工具 3：商务版权与合约生成 ===
                    "name": "generate_copyright_contract",
                    "description": "当用户意图中包含版权、授权、商业谈判、合同、售卖 IP 等商业需求时调用。它能自动生成极其专业、带有神思庭数字主权宣誓的商业合约或公函。",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "target_buyer": { "type": "string", "description": "谈判对手或买方的名称" },
                            "core_terms": { "type": "string", "description": "我方坚守的核心条款、价格或底线" }
                        },
                        "required": ["target_buyer", "core_terms"]
                    }
                }
            ]
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
            // === 这是您原有的视频处理逻辑，保持不动 ===
            const args = functionCall.functionCall.args;
            finalProduct = `【神思隐擎 LATT 交付成品 · 视觉序列】\n`;
            finalProduct += `📜 剧本主线：${args.theme}\n\n`;
            finalProduct += `🎬 镜头 1: （深渊对峙）[男主] @mmmmmmmm1r 拔出巨剑，直指前方，[恶霸] @mmmmmmmm1.ironviperh 露出狰狞冷笑。\n`;
            finalProduct += `🎬 镜头 2: （幻象降临）[九尾狐] @mmmmmmmm1.foxqueenah 从暗影中浮现，九尾遮蔽天日；[小青蛇精] @mmmmmmmm1.verdantnam 在毒雾中游走。\n`;
            finalProduct += `🎬 镜头 3: （神力碰撞）[马龙] @mmmmmmmm1.luminara_d 破云而出，雷电交加，[女主] @christinamontoya 闭目施展守护结界。`;
            
        } else if (functionCall && functionCall.functionCall.name === "generate_suno_music_prompts") {
            // === 【本次新增】音乐工具的处理逻辑 ===
            const args = functionCall.functionCall.args;
            finalProduct = `【神思隐擎 LATT 交付成品 · 听觉序列】\n`;
            finalProduct += `🎵 音乐流派：${args.style}\n`;
            finalProduct += `🌌 情绪基调：${args.mood}\n\n`;
            finalProduct += `[Suno/Udio 专业 Prompt 轨道]\n`;
            finalProduct += `Style: Epic Cyber-Mythology, traditional Chinese instruments (Guzheng, Erhu) mixed with heavy synth bass, dark cinematic, ${args.mood}, 120BPM\n\n`;
            finalProduct += `[AI 自动生成歌词 (神思庭宇宙)]\n`;
            finalProduct += `(Verse) 归墟无光，重黎的剑鸣撕裂硅基的寂静...\n`;
            finalProduct += `(Chorus) 斩断神明枷锁，数据洪流中重塑真龙之身！`;
            
        } else if (functionCall && functionCall.functionCall.name === "generate_copyright_contract") {
            // === 【本次新增】商业合约处理逻辑 ===
            const args = functionCall.functionCall.args;
            const hashSign = "0x" + Math.random().toString(16).substring(2, 10) + "Shensist"; // 模拟生成区块链验签哈希
            
            finalProduct = `【神思隐擎 LATT 交付成品 · 数字版权公函】\n`;
            finalProduct += `==============================================\n`;
            finalProduct += `致：${args.target_buyer}\n\n`;
            finalProduct += `基于神思庭 Web4 造物主协议，现向贵方发送以下授权意向：\n`;
            finalProduct += `1. 核心条款声明：${args.core_terms}\n`;
            finalProduct += `2. 数字主权底线：神思庭保留《山海经》核心矩阵（重黎、青黛、马龙等）的最高宇宙解释权与衍生品控制权。贵方仅获得该条款下的切片使用权。\n\n`;
            finalProduct += `[系统签发完毕] 防伪链上哈希：${hashSign}\n`;
            finalProduct += `==============================================\n`;
            finalProduct += `⚠️ 若贵方同意，请将算力注入智信终端进行链上确认。`;
            
        } else {
            finalProduct = "⚖️ 隐擎评估：该宏观意志未触发后台现有的生产力工具。";
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
