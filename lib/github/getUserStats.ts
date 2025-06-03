// lib/github/getUserStats.ts
import { getCommitsFromEvents } from './getCommitsFromEvents'
import { getCommitsFromRepos } from './getCommitsFromRepos'

export interface UserStats {
    streak: number
    commits: number
    pullRequests: number
    issues: number
    codeReviews: number
    diversity: number
    activeDays: number
    contributionDates?: string[]
}

export async function getGitHubUserStats(username: string, token: string, resetDate?: string): Promise<UserStats> {
    const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
    }

    const cloakHeaders = {
        ...headers,
        Accept: 'application/vnd.github.cloak-preview',    }    // HARDCODED: Sempre usar 1° de junho de 2025 às 00:00 horário de Brasília
    const JUNE_FIRST_2025 = '2025-06-01'
    // Criar data exatamente às 00:00 do horário de Brasília = 03:00 UTC
    const resetDateTime = new Date('2025-06-01T03:00:00.000Z') // 03:00 UTC = 00:00 Brasília
      console.log(`📅 Data de corte: 1° junho 2025 às 00:00 (Brasília)`);
    console.log(`📅 Equivalente em UTC: ${resetDateTime.toISOString()}`);
      // TENTAR CORRIGIR O ERRO 422: Usar diferentes estratégias para a query de commits
    // A API Search Commits às vezes é mais restritiva
    const commitsQueries = [
        `author:${username} committer-date:>=${JUNE_FIRST_2025}`,
        `${username} committer-date:>=${JUNE_FIRST_2025}`,
        `author:${username} type:commit committer-date:>=${JUNE_FIRST_2025}`,
    ];
    
    const prQuery = `type:pr author:${username} created:>=${JUNE_FIRST_2025}`
    const issuesQuery = `type:issue author:${username} created:>=${JUNE_FIRST_2025}`
    const reviewsQuery = `type:pr reviewed-by:${username} created:>=${JUNE_FIRST_2025}`
    
    // Tentar múltiplas queries de commits até uma funcionar
    let commitsRes: Response | null = null;
    for (const query of commitsQueries) {
        try {
            console.log(`🔍 Tentando query de commits: ${query}`);
            const response = await fetch(`https://api.github.com/search/commits?q=${encodeURIComponent(query)}`, { headers: cloakHeaders });
            if (response.status === 200) {
                commitsRes = response;
                console.log(`✅ Query funcionou: ${query}`);
                break;
            } else {
                console.log(`❌ Query falhou (${response.status}): ${query}`);
            }
        } catch (error) {
            console.log(`❌ Erro na query: ${query}`, error);
        }
    }
    
    // Se nenhuma query de commits funcionou, criar uma resposta mock
    if (!commitsRes) {
        console.log("🔄 Nenhuma query de commits funcionou, criando resposta mock...");
        commitsRes = new Response(JSON.stringify({ total_count: 0, message: "All commit queries failed" }), {
            status: 422,
            statusText: "Unprocessable Entity"
        });
    }    const [prRes, issuesRes, reviewsRes, eventsRes] = await Promise.all([
        fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(prQuery)}`, { headers }),
        fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(issuesQuery)}`, { headers }),
        fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(reviewsQuery)}`, { headers }),
        fetch(`https://api.github.com/users/${username}/events`, { headers }),
    ])

    // Verificar status das respostas
    console.log("🔍 Status das APIs:");
    console.log("Commits API status:", commitsRes.status, commitsRes.statusText);
    console.log("PRs API status:", prRes.status, prRes.statusText);
    console.log("Issues API status:", issuesRes.status, issuesRes.statusText);
    console.log("Reviews API status:", reviewsRes.status, reviewsRes.statusText);
    console.log("Events API status:", eventsRes.status, eventsRes.statusText);    // Processar as respostas uma por uma para melhor debugging
    let commitsData, prData, issuesData, reviewsData, eventsData;
    
    try {
        commitsData = await commitsRes.json();
        console.log("✅ Commits API response processada");
    } catch (error) {
        console.error("❌ Erro ao processar resposta da Commits API:", error);
        commitsData = { total_count: 0 };
    }
    
    try {
        prData = await prRes.json();
        console.log("✅ PRs API response processada");
    } catch (error) {
        console.error("❌ Erro ao processar resposta da PRs API:", error);
        prData = { total_count: 0 };
    }
    
    try {
        issuesData = await issuesRes.json();
        console.log("✅ Issues API response processada");
    } catch (error) {
        console.error("❌ Erro ao processar resposta da Issues API:", error);
        issuesData = { total_count: 0 };
    }
    
    try {
        reviewsData = await reviewsRes.json();
        console.log("✅ Reviews API response processada");
    } catch (error) {
        console.error("❌ Erro ao processar resposta da Reviews API:", error);
        reviewsData = { total_count: 0 };
    }
    
    try {
        eventsData = await eventsRes.json();
        console.log("✅ Events API response processada");
    } catch (error) {
        console.error("❌ Erro ao processar resposta da Events API:", error);
        eventsData = [];
    }
    
    // Filtrar eventos sempre a partir de 1° de junho de 2025
    const filteredEvents = Array.isArray(eventsData) ? eventsData.filter((event: any) => new Date(event.created_at) >= resetDateTime) : [];
      console.log("🔍 URLs das queries:");
    console.log("Commits queries tentadas:", commitsQueries);
    console.log("PRs query:", prQuery);
    console.log("Issues query:", issuesQuery);
    console.log("Reviews query:", reviewsQuery);
    
    console.log("📊 Dados retornados pelas APIs:");
    console.log("Commits data type:", typeof commitsData);
    console.log("Commits data keys:", Object.keys(commitsData || {}));
    console.log("Commits total_count:", commitsData?.total_count);
    console.log("Commits message:", commitsData?.message);
    console.log("Commits documentation_url:", commitsData?.documentation_url);
    
    if (commitsData?.total_count === undefined) {
        console.log("⚠️ ATENÇÃO: Commits API retornou undefined para total_count");
        console.log("Commits data completa:", JSON.stringify(commitsData, null, 2));
    }
    
    console.log("PRs total_count:", prData?.total_count);
    console.log("Issues total_count:", issuesData?.total_count);
    console.log("Reviews total_count:", reviewsData?.total_count);
    console.log("Events data length:", eventsData?.length || 0);
    console.log("Filtered events length:", filteredEvents.length);
    
    console.log("📈 Contadores finais:");
    console.log("Commits desde 1° Jun 2025:", commitsData?.total_count || 'UNDEFINED');
    console.log("Pull Requests desde 1° Jun 2025:", prData?.total_count || 0);
    console.log("Issues desde 1° Jun 2025:", issuesData?.total_count || 0);
    console.log("Code Reviews desde 1° Jun 2025:", reviewsData?.total_count || 0);
    console.log("Events desde 1° Jun 2025:", filteredEvents.length);
      const activeDays = new Set(filteredEvents.map((event: any) => event.created_at.slice(0, 10)))
    const diversity = new Set(filteredEvents.map((event: any) => event.repo?.name).filter(Boolean))
    const contributionDates = Array.from(activeDays).map(String);    // Se a API de search commits falhou ou retornou undefined, usar método alternativo
    let finalCommitsCount = commitsData?.total_count || 0;
    
    // Verificar se precisa usar método alternativo
    const needsAlternativeMethod = (
        !commitsData || 
        commitsData.total_count === undefined || 
        commitsData.total_count === null ||
        commitsData.message // API retornou erro
    );
    
    if (needsAlternativeMethod) {
        console.log("🔄 API de search commits falhou ou retornou dados inválidos, tentando método alternativo...");
        console.log("Motivo da falha:", {
            noData: !commitsData,
            undefinedCount: commitsData?.total_count === undefined,
            nullCount: commitsData?.total_count === null,
            hasErrorMessage: !!commitsData?.message,
            errorMessage: commitsData?.message
        });        try {
            // Primeiro tentar o método via events
            console.log("🔄 Tentativa 1: Método via Events API...");
            finalCommitsCount = await getCommitsFromEvents(username, token, JUNE_FIRST_2025);
            console.log("✅ Método via Events retornou:", finalCommitsCount);
            
            // Se o método via events retornou muito pouco, tentar método direto
            if (finalCommitsCount < 10) {
                console.log("⚠️ Resultado via Events parece baixo, tentando método direto por repositórios...");
                const repoMethodCount = await getCommitsFromRepos(username, token, JUNE_FIRST_2025);
                console.log("✅ Método via Repos retornou:", repoMethodCount);
                
                // Usar o maior dos dois valores
                if (repoMethodCount > finalCommitsCount) {
                    console.log("🎯 Método via Repos retornou mais commits, usando esse valor");
                    finalCommitsCount = repoMethodCount;
                }
            }
            
        } catch (error) {
            console.error("❌ Métodos alternativos também falharam:", error);
            finalCommitsCount = 0;
        }
    } else {
        console.log("✅ API de search commits funcionou corretamente:", finalCommitsCount);
    }

    console.log("🎯 Resultado final dos commits:", finalCommitsCount);

    return {
        streak: 0, // TODO: Calculate actual streak if needed
        commits: finalCommitsCount,
        pullRequests: prData.total_count || 0,
        issues: issuesData.total_count || 0,
        codeReviews: reviewsData.total_count || 0,
        diversity: diversity.size,
        activeDays: activeDays.size,
        contributionDates,
    }
}
