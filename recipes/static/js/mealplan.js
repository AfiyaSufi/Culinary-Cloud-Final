document.addEventListener('DOMContentLoaded', function() {
    const modal = createModal();
    document.body.appendChild(modal);
    
    const addToPlanButtons = document.querySelectorAll('.view-button');
    addToPlanButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.card');
            const recipeName = card.querySelector('.name h3').textContent;
            const recipeImage = card.querySelector('img').src;
            
            modal.querySelector('#selectedRecipe').value = recipeName;
            modal.querySelector('#selectedRecipeImg').value = recipeImage;
            
            modal.style.display = 'flex';
        });
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    modal.querySelector('form').addEventListener('submit', function(event) {
        event.preventDefault();
        
        const day = this.querySelector('#daySelect').value;
        const mealTime = this.querySelector('#mealTimeSelect').value;
        const recipeName = this.querySelector('#selectedRecipe').value;
        
        const calories = Math.floor(Math.random() * 900) + 300;
        
        addRecipeToMealPlan(day, mealTime, recipeName, calories);
        
        modal.style.display = 'none';
    });
    
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.item').remove();
        });
    });
});

function createModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Add to Meal Plan</h2>
            <form>
                <input type="hidden" id="selectedRecipe" value="">
                <input type="hidden" id="selectedRecipeImg" value="">
                
                <label for="daySelect">Select Day:</label>
                <select id="daySelect" required>
                    <option value="0">Sunday</option>
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                </select>
                
                <label for="mealTimeSelect">Select Meal:</label>
                <select id="mealTimeSelect" required>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                </select>
                
                <button type="submit">Add to Plan</button>
            </form>
        </div>
    `;
    
    return modal;
}

function addRecipeToMealPlan(dayIndex, mealTime, recipeName, calories) {
    let mealContainer;
    if (mealTime === 'breakfast') {
        mealContainer = document.querySelector('.breakfasts .contain');
    } else if (mealTime === 'lunch') {
        mealContainer = document.querySelector('.lunches .contain');
    } else if (mealTime === 'dinner') {
        mealContainer = document.querySelector('.dinners .contain');
    }
    
    const dayColumn = mealContainer.children[dayIndex];
    
    const newItem = document.createElement('div');
    newItem.className = 'item';
    newItem.innerHTML = `
        <div class="itemdesc">
            <h3>${recipeName}</h3>
            <div class="calorie">
                <img src="/static/images/meat.png" />
                <p>${calories} Calorie</p>
            </div>
        </div>
        <img src="/static/images/close.png" class="close" />
    `;
    
    newItem.querySelector('.close').addEventListener('click', function() {
        this.closest('.item').remove();
    });
    
    dayColumn.appendChild(newItem);
    
    updateDayCalories(dayIndex);
}

function updateDayCalories(dayIndex) {
    const mealTimes = ['breakfast', 'lunch', 'dinner'];
    let totalCalories = 0;
    
    mealTimes.forEach(mealTime => {
        let container;
        if (mealTime === 'breakfast') {
            container = document.querySelector('.breakfasts .contain');
        } else if (mealTime === 'lunch') {
            container = document.querySelector('.lunches .contain');
        } else if (mealTime === 'dinner') {
            container = document.querySelector('.dinners .contain');
        }
        
        const dayColumn = container.children[dayIndex];
        const items = dayColumn.querySelectorAll('.item');
        
        items.forEach(item => {
            const calorieText = item.querySelector('.calorie p').textContent;
            const calories = parseInt(calorieText.split(' ')[0]);
            totalCalories += calories;
        });
    });
    
    const dayHeader = document.querySelector('.days').children[dayIndex];
    dayHeader.querySelector('p').textContent = `Total Calories: ${totalCalories}`;

    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('close') || 
            (event.target.tagName === 'IMG' && event.target.classList.contains('close'))) {
            const item = event.target.closest('.item');
            if (item) {
                const itemsContainer = item.closest('.items');
                const dayIndex = Array.from(itemsContainer.parentElement.children).indexOf(itemsContainer);
                
                item.remove();
                updateDayCalories(dayIndex);
            }
        }
    });
}