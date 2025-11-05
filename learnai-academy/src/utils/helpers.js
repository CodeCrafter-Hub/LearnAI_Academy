export function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${mins}m`;
}

export function formatDate(date) {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return d.toLocaleDateString();
}

export function calculateStreak(activities) {
  if (!activities || activities.length === 0) return 0;
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (const activity of activities) {
    const activityDate = new Date(activity.activityDate);
    activityDate.setHours(0, 0, 0, 0);
    
    if (activityDate.getTime() === currentDate.getTime()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}

export function getMasteryLabel(level) {
  if (level >= 0.9) return 'Master';
  if (level >= 0.7) return 'Proficient';
  if (level >= 0.5) return 'Developing';
  if (level >= 0.3) return 'Beginning';
  return 'Not Started';
}

export function getMasteryColor(level) {
  if (level >= 0.9) return 'text-green-600';
  if (level >= 0.7) return 'text-blue-600';
  if (level >= 0.5) return 'text-yellow-600';
  if (level >= 0.3) return 'text-orange-600';
  return 'text-gray-600';
}

export function getGradeName(grade) {
  if (grade === 0) return 'Kindergarten';
  if (grade === 1) return '1st Grade';
  if (grade === 2) return '2nd Grade';
  if (grade === 3) return '3rd Grade';
  return `${grade}th Grade`;
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
}

export function average(numbers) {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

export function percentage(part, total) {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}
