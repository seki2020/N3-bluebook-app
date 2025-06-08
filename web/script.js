let grammarData = []; // Declare grammarData globally, but initialize it empty

const searchInput = document.getElementById('searchInput');
const chapterFilter = document.getElementById('chapterFilter');
const grammarListDiv = document.getElementById('grammarList');
const currentCountSpan = document.getElementById('currentCount');

function createListItem(label, content) {
    if (!content) return '';
    return `
        <h3>${label}</h3>
        <ul>
            <li>${content.split('\n').map(item => `<span>${item}</span>`).join('<br>')}</li>
        </ul>
    `;
}

function createExampleItem(examplesContent) {
    if (!examplesContent) return '';
    const examplesHtml = examplesContent.split('\n\n').map(example => {
        const parts = example.split(' CH: ');
        let japanese = parts[0] ? parts[0].replace('JP: ', '') : '';
        let chinese = parts[1] || '';
        let source = '';

        // Extract source if present
        const sourceMatch = chinese.match(/\s\(Source: (.+?)\)$/);
        if (sourceMatch) {
            source = sourceMatch[1];
            chinese = chinese.replace(sourceMatch[0], '');
        }

        return `
            <div class="example-item">
                <div class="japanese">${japanese}</div>
                <div class="chinese">${chinese}</div>
                ${source ? `<div class="source">(Source: ${source})</div>` : ''}
            </div>
        `;
    }).join('');
    return `
        <h3>例句</h3>
        ${examplesHtml}
    `;
}

function displayGrammarPoints(data) {
    grammarListDiv.innerHTML = ''; // Clear previous results
    if (data.length === 0) {
        grammarListDiv.innerHTML = '<div class="no-results">没有找到匹配的语法点。</div>';
        currentCountSpan.textContent = 0;
        return;
    }

    data.forEach(point => {
        const grammarPointDiv = document.createElement('div');
        grammarPointDiv.classList.add('grammar-point');

        const headerDiv = document.createElement('div');
        headerDiv.classList.add('grammar-point-header');
        headerDiv.innerHTML = `
            <div>
                ${point.pattern}
                ${point.readings ? `<span class="readings">${point.readings}</span>` : ''}
                ${point.chapter ? `<span class="chapter-info" style="font-size: 0.6em; color: #0056b3; margin-left: 15px; padding: 3px 8px; background-color: #cce5ff; border-radius: 5px;">章节: ${point.chapter}</span>` : ''}
            </div>
            <span class="toggle-icon">▶</span>
        `;
        grammarPointDiv.appendChild(headerDiv);

        const detailsDiv = document.createElement('div');
        detailsDiv.classList.add('grammar-details');
        detailsDiv.innerHTML = `
            ${createListItem('接续', point.connection_rules)}
            ${createListItem('说明', point.explanation_notes)}
            ${createExampleItem(point.examples)}
            ${createListItem('注意', point.usage_notes)}
        `;
        grammarPointDiv.appendChild(detailsDiv);

        // Add click listener to the header to toggle the 'expanded' class
        headerDiv.addEventListener('click', () => {
            grammarPointDiv.classList.toggle('expanded');
        });

        grammarListDiv.appendChild(grammarPointDiv);
    });
    currentCountSpan.textContent = data.length; // Update total count
}

function filterGrammarPoints() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedChapter = chapterFilter.value;
    const selectedChapterNum = selectedChapter === 'all' ? 'all' : parseInt(selectedChapter);

    const filteredData = grammarData.filter(point => {
        const matchesSearch = (
            point.pattern.toLowerCase().includes(searchTerm) ||
            (point.readings && point.readings.toLowerCase().includes(searchTerm)) ||
            (point.connection_rules && point.connection_rules.toLowerCase().includes(searchTerm)) ||
            (point.explanation_notes && point.explanation_notes.toLowerCase().includes(searchTerm)) ||
            (point.examples && point.examples.toLowerCase().includes(searchTerm)) ||
            (point.usage_notes && point.usage_notes.toLowerCase().includes(searchTerm))
        );

        const matchesChapter = (selectedChapterNum === 'all' || point.chapter === selectedChapterNum);

        return matchesSearch && matchesChapter;
    });
    displayGrammarPoints(filteredData);
}

// --- 数据加载部分 ---
// 使用 fetch API 从 FastAPI 后端服务加载数据
fetch('/data/grammars.json')
    .then(response => {
        // 检查HTTP响应是否成功
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // 将响应体解析为JSON
        return response.json();
    })
    .then(data => {
        // 数据加载成功后，将其赋值给 grammarData 变量
        grammarData = data;

        // Populate chapter filter options
        const chapters = [...new Set(grammarData.map(point => point.chapter).filter(Boolean))].sort((a, b) => a - b);
        chapters.forEach(chapter => {
            const option = document.createElement('option');
            option.value = chapter;
            option.textContent = `章节: ${chapter}`;
            chapterFilter.appendChild(option);
        });

        // 显示初始的语法点列表
        displayGrammarPoints(grammarData);
        // 在数据加载完成后，再绑定搜索框和章节筛选器的事件监听器
        searchInput.addEventListener('input', filterGrammarPoints);
        chapterFilter.addEventListener('change', filterGrammarPoints);
    })
    .catch(error => {
        // 捕获加载过程中可能发生的错误
        console.error('Error loading grammar data from backend:', error);
        grammarListDiv.innerHTML = '<div class="no-results" style="color: red;">加载语法数据失败，请确保后端服务已运行且可访问 (http://localhost:8000/grammar_rules)。</div>';
    });
// --- 数据加载部分结束 ---

// Add event listener for the new "Try" button
const tryQuizButton = document.getElementById('tryQuizButton');
if (tryQuizButton) {
    tryQuizButton.addEventListener('click', () => {
        const selectedChapter = chapterFilter.value;
        if (selectedChapter === 'all') {
            alert('请选择一个具体的章节进行测验。');
            return;
        }
        // Construct the URL for the quiz based on the selected chapter
        // The backend route is /quiz/{chNo}, so we can directly use the chapter number
        const quizUrl = `/quiz/${selectedChapter}`;
        window.open(quizUrl, '_blank');
    });
}
