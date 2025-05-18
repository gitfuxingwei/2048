const boardSize = 4;
let board = [];
const gameBoard = document.getElementById('game-board');
const scoreDisplay = document.getElementById('score'); // 获取得分显示元素
let score = 0;
const animationDuration = 150; // 设置动画持续时间为150毫秒
let recentScores = []; // 历史得分

// 初始化游戏板
function initBoard() {
  for (let i = 0; i < boardSize; i++) {
    board[i] = Array(boardSize).fill(0);
  }
  addNewTile();
  addNewTile();
  renderBoard();
  updateScoreDisplay(); // 初始得分更新
}

// 渲染游戏板
async function renderBoard() {
  await new Promise((resolve) => {
    setTimeout(() => {
      gameBoard.innerHTML = '';
      for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
          const tile = document.createElement('div');
          tile.classList.add('cell');
          if (board[r][c]) {
            tile.textContent = board[r][c];
          }
          gameBoard.appendChild(tile);
        }
      }
      resolve();
    }, animationDuration);
  });
  updateScoreDisplay(); // 每次渲染后更新得分
}

// 更新得分显示
function updateScoreDisplay() {
  scoreDisplay.textContent = calculateTotalScore();
}

// 计算总得分（所有方块数字之和）
function calculateTotalScore() {
  let totalScore = 0;
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      totalScore += board[r][c];
    }
  }
  return totalScore;
}

// 添加新方块
function addNewTile() {
  const emptyCells = [];
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (!board[r][c]) {
        emptyCells.push({r, c});
      }
    }
  }
  if (emptyCells.length) {
    const {r, c} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    board[r][c] = Math.random() > 0.9 ? 4 : 2;
  }
}

// 辅助函数：压缩非零元素到左边（或上边），并返回是否发生变化
function compressRow(row) {
  let newRow = row.filter(num => num !== 0);
  while (newRow.length < boardSize) newRow.push(0);
  return newRow;
}

// 辅助函数：合并相邻相同元素，并返回是否发生变化
function mergeRow(row) {
  for (let i = 0; i < row.length - 1; i++) {
    if (row[i] === row[i + 1]) {
      row[i] *= 2;
      score += row[i]; // 更新得分
      row[i + 1] = 0;
    }
  }
  return row;
}

// 移动和合并的一般函数
function moveAndMerge(row) {
  row = compressRow(row);
  row = mergeRow(row);
  row = compressRow(row);
  return row;
}

// 向上移动
async function moveUp() {
  for (let c = 0; c < boardSize; c++) {
    let column = [];
    for (let r = 0; r < boardSize; r++) {
      column.push(board[r][c]);
    }
    column = moveAndMerge(column);
    for (let r = 0; r < boardSize; r++) {
      board[r][c] = column[r];
    }
  }
  await handleMove(); // 等待处理移动
}

// 向下移动
async function moveDown() {
  for (let c = 0; c < boardSize; c++) {
    let column = [];
    for (let r = boardSize - 1; r >= 0; r--) {
      column.push(board[r][c]);
    }
    column = moveAndMerge(column);
    for (let r = boardSize - 1, j = 0; r >= 0; r--, j++) {
      board[r][c] = column[j];
    }
  }
  await handleMove(); // 等待处理移动
}

// 向左移动
async function moveLeft() {
  for (let r = 0; r < boardSize; r++) {
    board[r] = moveAndMerge(board[r].slice()); // 创建副本以避免直接修改原数组
  }
  await handleMove(); // 等待处理移动
}

// 向右移动
async function moveRight() {
  for (let r = 0; r < boardSize; r++) {
    let row = board[r].slice().reverse();
    row = moveAndMerge(row);
    board[r] = row.reverse();
  }
  await handleMove(); // 等待处理移动
}

// 检查游戏状态
function checkGameState() {
  // 检查是否有2048方块，如果有则显示胜利弹窗
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (board[r][c] === 2048) {
        showWinModal();
        return true; // 游戏胜利
      }
    }
  }
  
  // 检查是否还有可移动的方块
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (board[r][c] === 0 || (c < boardSize - 1 && board[r][c] === board[r][c + 1]) ||
          (r < boardSize - 1 && board[r][c] === board[r + 1][c])) {
        return false; // 游戏未结束
      }
    }
  }
  showEndGameModal();
  return true; // 游戏结束
}

// 显示游戏结束弹窗
function showEndGameModal() {
  const currentScore = calculateTotalScore();
  recentScores.push(currentScore);
  
  // 确保只保留最近五局的成绩
  if (recentScores.length > 5) {
    recentScores.shift(); // 移除最早的一局成绩
  }

  const modal = document.getElementById('end-game-modal');
  const recentScoresList = document.getElementById('recent-scores');
  recentScoresList.innerHTML = ''; // 清空列表

  // 添加最近五局的成绩到列表中
  recentScores.forEach((score, index) => {
    const li = document.createElement('li');
    li.textContent = `Game ${recentScores.length - index}: ${score}`;
    recentScoresList.appendChild(li);
  });

  modal.style.display = 'flex'; // 显示弹窗
}

// 隐藏游戏结束弹窗
function hideEndGameModal() {
  document.getElementById('end-game-modal').style.display = 'none';
}

// 重新开始游戏
function restartGame() {
  hideEndGameModal();
  initBoard();
}

// 显示游戏规则弹窗
function showRulesModal() {
  document.getElementById('rules-modal').style.display = 'flex'; // 显示弹窗
}

// 隐藏游戏规则弹窗
function hideRulesModal() {
  document.getElementById('rules-modal').style.display = 'none';
}

// 绑定关闭按钮点击事件
document.getElementById('close-modal').addEventListener('click', hideRulesModal);

// 绑定开始游戏按钮点击事件
document.getElementById('start-game-btn').addEventListener('click', hideRulesModal);

// 创建烟花特效
function createFirework(x, y) {
  const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
  const firework = document.createElement('div');
  firework.className = 'firework';
  firework.style.left = `${x}px`;
  firework.style.top = `${y}px`;
  firework.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
  document.body.appendChild(firework);
  
  // 烟花爆炸动画
  setTimeout(() => {
    firework.classList.add('explode');
    setTimeout(() => {
      document.body.removeChild(firework);
    }, 1000);
  }, 100);
}

// 显示胜利弹窗
function showWinModal() {
  const currentScore = calculateTotalScore();
  recentScores.push(currentScore);
  
  // 确保只保留最近五局的成绩
  if (recentScores.length > 5) {
    recentScores.shift();
  }

  // 创建胜利弹窗
  const winModal = document.createElement('div');
  winModal.id = 'win-modal';
  winModal.className = 'modal';
  winModal.innerHTML = `
    <div class="modal-content">
      <h2>恭喜你通关!</h2>
      <p>你成功合成了2048方块!</p>
      <p>最终得分: ${currentScore}</p>
      <button id="confirm-btn">确认</button>
    </div>
  `;
  document.body.appendChild(winModal);
  winModal.style.display = 'flex';
  
  // 绑定确认按钮点击事件
  document.getElementById('confirm-btn').addEventListener('click', () => {
    hideWinModal();
    restartGame();
  });
  
  // 显示烟花特效
  const fireworksCount = 20;
  const intervalId = setInterval(() => {
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    createFirework(x, y);
  }, 300);
  
  // 10秒后停止烟花
  setTimeout(() => {
    clearInterval(intervalId);
  }, 10000);
}

// 隐藏胜利弹窗
function hideWinModal() {
  const winModal = document.getElementById('win-modal');
  if (winModal) {
    document.body.removeChild(winModal);
  }
}

document.addEventListener('DOMContentLoaded', async function() {
  initBoard();
  showRulesModal(); // 页面加载时显示游戏规则

  // 绑定手机端按钮点击事件
  document.getElementById('up').addEventListener('click', moveUp);
  document.getElementById('down').addEventListener('click', moveDown);
  document.getElementById('left').addEventListener('click', moveLeft);
  document.getElementById('right').addEventListener('click', moveRight);

  // 监听键盘事件
  document.addEventListener('keydown', async function(event) {
    switch(event.key) {
      case 'ArrowUp':
        await moveUp();
        break;
      case 'ArrowDown':
        await moveDown();
        break;
      case 'ArrowLeft':
        await moveLeft();
        break;
      case 'ArrowRight':
        await moveRight();
        break;
    }
  });

  // 绑定重新开始按钮点击事件
  document.getElementById('restart-btn').addEventListener('click', restartGame);
});

async function handleMove() {
  addNewTile();
  await renderBoard(); // 确保新的方块被添加之后再进行渲染
  checkGameState();
}
