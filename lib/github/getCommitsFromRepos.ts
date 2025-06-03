// Função mais robusta para buscar commits diretamente dos repositórios do usuário
export async function getCommitsFromRepos(username: string, token: string, sinceDate: string): Promise<number> {
    const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
    }

    try {
        console.log("🔄 Iniciando busca robusta de commits pelos repositórios...");
        
        // Data: 1° junho 2025 às 00:00 horário de Brasília = 03:00 UTC
        const sinceDateTime = new Date(sinceDate + 'T03:00:00.000Z');
        console.log("📅 Contando commits desde: 1° junho 2025 às 00:00 (Brasília)");
        console.log("📅 Equivalente em UTC:", sinceDateTime.toISOString());
        
        // 1. Primeiro, buscar todos os repositórios do usuário
        console.log("📂 Buscando repositórios do usuário...");
        let allRepos: any[] = [];
        let page = 1;
        
        while (true) {
            const reposRes = await fetch(`https://api.github.com/users/${username}/repos?type=all&per_page=100&page=${page}`, { headers });
            
            if (!reposRes.ok) {
                console.log(`❌ Erro ao buscar repositórios (página ${page}):`, reposRes.status);
                break;
            }
            
            const repos = await reposRes.json();
            
            if (!Array.isArray(repos) || repos.length === 0) {
                break;
            }
            
            allRepos.push(...repos);
            page++;
        }
        
        console.log(`📂 Total de repositórios encontrados: ${allRepos.length}`);
        
        // 2. Para cada repositório, buscar commits do usuário desde a data especificada
        let totalCommits = 0;
        const repoCommits: { [key: string]: number } = {};
        
        for (const repo of allRepos) {
            try {
                console.log(`🔍 Analisando repositório: ${repo.full_name}`);
                
                // Verificar se o repo foi atualizado recentemente
                const lastUpdate = new Date(repo.updated_at);
                if (lastUpdate < sinceDateTime) {
                    console.log(`⏭️ Repositório ${repo.full_name} não foi atualizado desde a data de corte, pulando...`);
                    continue;
                }
                
                // Buscar commits do usuário neste repositório
                let repoCommitCount = 0;
                let commitPage = 1;
                const maxCommitPages = 10; // Limitar para evitar timeout
                
                while (commitPage <= maxCommitPages) {
                    const commitsUrl = `https://api.github.com/repos/${repo.full_name}/commits?author=${username}&since=${sinceDateTime.toISOString()}&per_page=100&page=${commitPage}`;
                    
                    const commitsRes = await fetch(commitsUrl, { headers });
                    
                    if (!commitsRes.ok) {
                        if (commitsRes.status === 409) {
                            console.log(`⚠️ Repositório ${repo.full_name} está vazio ou inacessível (409)`);
                        } else {
                            console.log(`❌ Erro ao buscar commits de ${repo.full_name} (página ${commitPage}):`, commitsRes.status);
                        }
                        break;
                    }
                    
                    const commits = await commitsRes.json();
                    
                    if (!Array.isArray(commits) || commits.length === 0) {
                        break;
                    }
                    
                    // Filtrar commits do usuário e dentro da data
                    const userCommits = commits.filter((commit: any) => {
                        const commitDate = new Date(commit.commit.committer.date);
                        const isUserCommit = commit.author?.login === username || commit.commit.author.email?.includes(username);
                        const isAfterCutoff = commitDate >= sinceDateTime;
                        
                        if (isUserCommit && isAfterCutoff) {
                            // Log detalhado com fuso horário
                            const brasiliTime = new Date(commitDate.getTime() - 3 * 60 * 60 * 1000);
                            console.log(`📝 ${commit.commit.committer.date} (UTC) = ${brasiliTime.toISOString().replace('Z', ' BRT')} - ${repo.full_name}: ${commit.sha.substring(0, 7)} - ${commit.commit.message.split('\n')[0]}`);
                        }
                        
                        return isUserCommit && isAfterCutoff;
                    });
                    
                    repoCommitCount += userCommits.length;
                    
                    // Se encontramos menos de 100 commits, provavelmente chegamos ao fim
                    if (commits.length < 100) {
                        break;
                    }
                    
                    commitPage++;
                }
                
                if (repoCommitCount > 0) {
                    repoCommits[repo.full_name] = repoCommitCount;
                    totalCommits += repoCommitCount;
                    console.log(`✅ ${repo.full_name}: ${repoCommitCount} commits`);
                }
                
            } catch (error) {
                console.error(`❌ Erro ao processar repositório ${repo.full_name}:`, error);
            }
        }
        
        console.log("📈 Resumo final por repositório:", repoCommits);
        console.log("✅ Total de commits contados (método direto por repos):", totalCommits);
        
        return totalCommits;
        
    } catch (error) {
        console.error("❌ Erro ao buscar commits pelos repositórios:", error);
        return 0;
    }
}
