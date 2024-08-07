let trelloToken = '';
const DONATION_URL = 'https://www.donationalerts.com/r/serter2069';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Popup DOM loaded');
    checkForToken();
});

function checkForToken() {
    console.log('Checking for token');
    chrome.storage.local.get(['trelloToken', 'selectedBoard', 'selectedList'], (result) => {
        console.log('Data from chrome.storage.local:', result);
        if (result.trelloToken) {
            trelloToken = result.trelloToken;
            showTaskSection();
            loadBoards(result.selectedBoard, result.selectedList);
        } else {
            showLoginSection();
        }
    });
}

function showLoginSection() {
    console.log('Showing login section');
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('task-section').style.display = 'none';
    document.getElementById('donate-button').style.display = 'none';
}

function showTaskSection() {
    console.log('Showing task section');
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('task-section').style.display = 'block';
    document.getElementById('donate-button').style.display = 'block';
}

document.getElementById('login').addEventListener('click', () => {
    console.log('Login button clicked');
    const authUrl = `https://trello.com/1/authorize?expiration=never&name=TrelloTaskCreator&scope=read,write&response_type=token&key=babcecfea25f6c4d4e5507e2e94eee2e&return_url=https://trello.terekhovsergei.life/redirect.html`;
    chrome.tabs.create({ url: authUrl });
});

function loadBoards(selectedBoardId, selectedListId) {
    console.log('Loading boards');
    fetch(`https://api.trello.com/1/members/me/boards?key=babcecfea25f6c4d4e5507e2e94eee2e&token=${trelloToken}`)
        .then(response => response.json())
        .then(boards => {
            console.log('Boards loaded:', boards);
            const boardSelect = document.getElementById('board-select');
            boardSelect.innerHTML = '<option value="">Select a board</option>';
            boards.forEach(board => {
                const option = document.createElement('option');
                option.value = board.id;
                option.textContent = board.name;
                boardSelect.appendChild(option);
            });
            if (selectedBoardId) {
                boardSelect.value = selectedBoardId;
                loadLists(selectedBoardId, selectedListId);
            }
            boardSelect.addEventListener('change', () => {
                const selectedBoard = boardSelect.value;
                chrome.storage.local.set({selectedBoard: selectedBoard});
                loadLists(selectedBoard);
            });
        })
        .catch(error => {
            console.error('Error loading boards:', error);
            alert('Failed to load boards. Please try logging in again.');
            showLoginSection();
        });
}

function loadLists(boardId, selectedListId) {
    console.log('Loading lists');
    if (!boardId) return;

    fetch(`https://api.trello.com/1/boards/${boardId}/lists?key=babcecfea25f6c4d4e5507e2e94eee2e&token=${trelloToken}`)
        .then(response => response.json())
        .then(lists => {
            console.log('Lists loaded:', lists);
            const listSelect = document.getElementById('list-select');
            listSelect.innerHTML = '<option value="">Select a list</option>';
            lists.forEach(list => {
                const option = document.createElement('option');
                option.value = list.id;
                option.textContent = list.name;
                listSelect.appendChild(option);
            });
            if (selectedListId) {
                listSelect.value = selectedListId;
            }
            listSelect.addEventListener('change', () => {
                const selectedList = listSelect.value;
                chrome.storage.local.set({selectedList: selectedList});
            });
        })
        .catch(error => {
            console.error('Error loading lists:', error);
            alert('Failed to load lists. Please try selecting a different board or log in again.');
        });
}

document.getElementById('create-task').addEventListener('click', () => {
    console.log('Create task button clicked');
    const taskTitle = document.getElementById('task-title').value;
    const taskDesc = document.getElementById('task-desc').value;
    const listId = document.getElementById('list-select').value;

    if (!taskTitle || !listId) {
        alert('Please enter a task title and select a list');
        return;
    }

    const url = `https://api.trello.com/1/cards?key=babcecfea25f6c4d4e5507e2e94eee2e&token=${trelloToken}&idList=${listId}&name=${encodeURIComponent(taskTitle)}&desc=${encodeURIComponent(taskDesc)}`;

    fetch(url, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            console.log('Task created:', data);
            if (data.id) {
                document.getElementById('task-title').value = '';
                document.getElementById('task-desc').value = '';
                document.getElementById('task-created').style.display = 'block';
                setTimeout(() => {
                    document.getElementById('task-created').style.display = 'none';
                }, 3000);
            } else {
                alert('Failed to create task');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while creating the task');
        });
});

document.getElementById('logout').addEventListener('click', () => {
    console.log('Logout button clicked');
    chrome.storage.local.remove(['trelloToken', 'selectedBoard', 'selectedList'], () => {
        console.log('Token and selections removed from chrome.storage');
        trelloToken = '';
        showLoginSection();
    });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Message received in popup:', message);
    if (message.action === "auth_success") {
        console.log('Auth success message received');
        checkForToken();
    }
});

document.getElementById('donate-button').addEventListener('click', () => {
    chrome.tabs.create({ url: DONATION_URL });
});