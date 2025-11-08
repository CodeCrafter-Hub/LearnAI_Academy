# Grade Access Passwords - Testing Guide

## Overview
For testing and improving content across different grade levels, we've implemented a password-protected grade access system. This allows developers to switch between different grade levels and test content without having to create multiple user accounts.

## How to Use

1. **Navigate to the Learn Page** (`/learn`)
2. **Look for the Grade Selector** in the top navigation (appears on the subject selection screen)
3. **Select a Grade** from the dropdown menu
4. **Enter Password** when prompted (if testing a grade different from your account's grade)
5. **Access Unlocked** - Once unlocked, the grade remains accessible for the current session

## Grade Passwords

| Grade Level | Password |
|-------------|----------|
| Kindergarten (K) | `kindergarten2024` |
| Grade 1 | `grade1learn` |
| Grade 2 | `grade2learn` |
| Grade 3 | `grade3learn` |
| Grade 4 | `grade4learn` |
| Grade 5 | `grade5learn` |
| Grade 6 | `grade6learn` |
| Grade 7 | `grade7learn` |
| Grade 8 | `grade8learn` |
| Grade 9 | `grade9learn` |
| Grade 10 | `grade10learn` |
| Grade 11 | `grade11learn` |
| Grade 12 | `grade12learn` |

## Features

- **Session-Based Unlocking**: Once you unlock a grade, it stays unlocked for the current browser session
- **No Account Modification**: Your actual user account grade level remains unchanged
- **Easy Testing**: Quickly switch between grades to test content, topics, and learning paths
- **Secure**: Passwords are required for grades different from your account's grade level

## Technical Details

### Password Storage
- Unlocked grades are stored in `sessionStorage` under the key `unlockedGrades`
- Data persists only for the current tab/session
- Passwords are validated client-side (development feature only)

### Implementation Files
- **Password Prompt Component**: `src/components/learning/GradePasswordPrompt.js`
- **Learn Page Integration**: `src/app/learn/page.js`

### For Developers

To modify passwords, edit the `GRADE_PASSWORDS` object in:
```javascript
// src/components/learning/GradePasswordPrompt.js
const GRADE_PASSWORDS = {
  0: 'kindergarten2024',  // Kindergarten
  1: 'grade1learn',
  // ... etc
};
```

## Security Note

⚠️ **This is a development/testing feature only.** In production:
- Consider removing the grade selector from the UI
- Or implement server-side grade access validation
- Or restrict this feature to admin accounts only

## Testing Workflow

1. **Test Content Consistency**
   - Switch between grades to ensure content is age-appropriate
   - Verify difficulty levels match grade expectations

2. **Test Learning Paths**
   - Check that topics progress logically within each grade
   - Ensure prerequisites are appropriate for each grade level

3. **Test UI/UX**
   - Verify that UI elements work correctly for all grades
   - Check that language and examples are grade-appropriate

4. **Test Edge Cases**
   - Test the lowest grade (Kindergarten)
   - Test the highest grade (Grade 12)
   - Test transitions between grades

## Troubleshooting

**Problem**: Password prompt doesn't appear
- **Solution**: Make sure you're selecting a grade different from your account's grade level

**Problem**: Password not working
- **Solution**: Check the exact password in the table above (case-sensitive)

**Problem**: Grade stays unlocked after refresh
- **Solution**: This is expected - sessionStorage persists within the same tab. Close the tab to reset.

**Problem**: Can't switch back to original grade
- **Solution**: Your account's original grade never requires a password, just select it from the dropdown

## Future Enhancements

- [ ] Add admin panel for password management
- [ ] Implement server-side validation
- [ ] Add password expiration
- [ ] Create audit log for grade access
- [ ] Add bulk unlock feature for admins
