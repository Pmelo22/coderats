// Função alternativa para buscar commits usando a API de eventos
export async function getCommitsFromEvents(username: string, token: string, sinceDate: string): Promise<number> {
    const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
    }

    try {        console.log("🔄 Iniciando busca alternativa de commits...");
        
        // Buscar múltiplas páginas de eventos para cobrir mais tempo
        let allEvents: any[] = [];
        let page = 1;
        const maxPages = 20; // Aumentar para 20 páginas para capturar mais eventos

        while (page <= maxPages) {
            console.log(`📄 Buscando página ${page} de eventos...`);
            const eventsRes = await fetch(`https://api.github.com/users/${username}/events?per_page=100&page=${page}`, { headers });
            
            if (!eventsRes.ok) {
                console.log(`❌ Erro na página ${page}:`, eventsRes.status, eventsRes.statusText);
                break;
            }
            
            const events = await eventsRes.json();
            
            if (!Array.isArray(events) || events.length === 0) {
                console.log(`✅ Sem mais eventos na página ${page}, parando busca`);
                break;
            }
            
            // Verificar se os eventos são muito antigos
            const oldestEventDate = new Date(events[events.length - 1].created_at);
            const sinceDateTime = new Date(sinceDate);
            
            if (oldestEventDate < sinceDateTime) {
                // Filtrar apenas os eventos que são depois da data limite
                const recentEvents = events.filter((event: any) => new Date(event.created_at) >= sinceDateTime);
                allEvents.push(...recentEvents);
                console.log(`📅 Página ${page}: ${recentEvents.length} eventos relevantes encontrados (de ${events.length} total)`);
                break; // Não precisamos buscar páginas mais antigas
            } else {
                allEvents.push(...events);
                console.log(`📅 Página ${page}: ${events.length} eventos adicionados`);
            }
            
            page++;
        }        console.log(`📊 Total de eventos coletados: ${allEvents.length}`);

        // Data: 1° junho 2025 às 00:00 horário de Brasília = 03:00 UTC
        const sinceDateTime = new Date(sinceDate + 'T03:00:00.000Z'); // 03:00 UTC = 00:00 Brasília        console.log("📅 Contando commits desde: 1° junho 2025 às 00:00 (Brasília)");
        console.log("📅 Equivalente em UTC:", sinceDateTime.toISOString());

        // Filtrar eventos de commits desde a data especificada
        // Incluir PushEvent e outros eventos que podem conter commits
        const commitEvents = allEvents.filter((event: any) => {
            const eventDate = new Date(event.created_at);
            const isAfterCutoff = eventDate >= sinceDateTime;
            const isCommitRelated = ['PushEvent', 'CreateEvent'].includes(event.type);
            return isCommitRelated && isAfterCutoff;
        });

        console.log("📊 Eventos relacionados a commits encontrados:", commitEvents.length);
        
        // Separar por tipo para análise detalhada
        const pushEvents = commitEvents.filter(e => e.type === 'PushEvent');
        const createEvents = commitEvents.filter(e => e.type === 'CreateEvent');
        
        console.log(`📝 Push events: ${pushEvents.length}, Create events: ${createEvents.length}`);

        // Contar commits dentro de cada push event
        let totalCommits = 0;
        const repoCommits: { [key: string]: number } = {};
        
        pushEvents.forEach((event: any) => {
            if (event.payload && event.payload.commits) {                const commits = event.payload.commits.length;
                totalCommits += commits;
                
                const repoName = event.repo?.name || 'unknown';
                repoCommits[repoName] = (repoCommits[repoName] || 0) + commits;
                
                // Log detalhado com fuso horário
                const eventDate = new Date(event.created_at);
                const brasiliTime = new Date(eventDate.getTime() - 3 * 60 * 60 * 1000);
                console.log(`📝 ${event.created_at} (UTC) = ${brasiliTime.toISOString().replace('Z', ' BRT')} - ${repoName}: ${commits} commits`);
            }
        });

        console.log("📈 Resumo por repositório:", repoCommits);
        console.log("✅ Total de commits contados:", totalCommits);
        
        return totalCommits;

    } catch (error) {
        console.error("❌ Erro ao buscar commits por eventos:", error);
        return 0;
    }
}
