# Analytics Dashboard - Profile-Based Feature Update

## ✅ What Changed

The Analytics Dashboard is now **profile-based**, meaning you can view analytics for different wardrobe profiles (yourself, family members, etc.).

## 🎯 Key Features

### 1. Profile Selector
- Dropdown menu in the page header
- Shows all available profiles:
  - **Main Wardrobe** - Items without a profile assignment
  - **Your Profile** - Marked with "(You)"
  - **Family Member Profiles** - e.g., "Son", "Daughter", "Partner"

### 2. URL-Based Profile Selection
- Profile selection is preserved in the URL
- Example: `/analytics?profile=profile-id-123`
- Share specific profile analytics via URL
- Refreshing the page maintains profile selection

### 3. Profile-Specific Analytics
All metrics are filtered by the selected profile:
- ✅ Total Items (for that profile)
- ✅ Most/Least Worn Items (from that profile's wardrobe)
- ✅ Category Breakdown (that profile's items)
- ✅ Weather Readiness (that profile's gear)
- ✅ Style Profile (that profile's preferences)
- ✅ Closet Insights (recommendations for that profile)

### 4. Visual Profile Indicator
When viewing a specific profile, a banner shows:
```
👤 Viewing analytics for: [Profile Name]
```

## 🔧 Technical Implementation

### Updated Hook Signature
```typescript
// Before
useAnalyticsData(userId?: string)

// After
useAnalyticsData(userId?: string, profileId?: string | null)
```

### Database Filtering
```typescript
// Filters wardrobe items by profile
if (profileId) {
  query = query.eq("wardrobe_profile_id", profileId)
} else {
  // Main wardrobe (items without profile)
  query = query.is("wardrobe_profile_id", null)
}
```

### State Management
- Profile list loaded on page mount
- Default selection: Owner profile or first profile
- URL parameter handling for deep linking
- Profile change updates URL without page reload

## 📱 User Experience

### Initial Load
1. Page loads
2. Fetches all profiles for the user
3. Selects default profile (owner or first)
4. Loads analytics for that profile

### Switching Profiles
1. User clicks profile dropdown
2. Selects different profile
3. URL updates with `?profile=id`
4. Analytics reload for new profile
5. All charts and metrics update

### Sharing Analytics
Users can share profile-specific analytics:
```
/analytics?profile=abc123  → Son's analytics
/analytics                 → Main wardrobe analytics
```

## 🎨 UI Components

### Profile Selector (New)
- Location: Top-right of page header
- Design: Dark slate card with User icon
- Options:
  - "Main Wardrobe" (no profile filter)
  - Individual profiles with names

### Profile Banner (New)
- Shows when viewing specific profile
- Purple/pink gradient background
- Clear indicator of current selection

## 🔄 Data Flow

```
User selects profile
    ↓
Update selectedProfileId state
    ↓
Update URL parameter
    ↓
useAnalyticsData hook detects change
    ↓
Fetch new data with profile filter
    ↓
Compute analytics for profile
    ↓
Update all components
```

## 📊 Use Cases

### Family Wardrobe Management
Parents can:
- View son's wardrobe analytics
- Check daughter's most worn items
- Monitor partner's weather readiness
- Compare analytics across family members

### Personal Multi-Wardrobes
Users with multiple profiles:
- Work wardrobe analytics
- Casual wardrobe analytics
- Formal wear analytics
- Seasonal wardrobe analytics

### Household Planning
- Check who needs new winter gear
- See which profile has wardrobe imbalances
- Track wear patterns across family
- Make informed purchasing decisions

## 🚀 Quick Start

### For Users
1. Go to `/analytics`
2. Click profile dropdown (top-right)
3. Select profile to view
4. All analytics update automatically

### For Developers
```typescript
// Use the hook with profile filtering
const analytics = useAnalyticsData(user.id, selectedProfileId)

// Profile can be null (main wardrobe) or profile ID
```

## 🔮 Future Enhancements

### Comparison View
- Side-by-side analytics for multiple profiles
- Compare wardrobe health scores
- Identify common gaps across profiles

### Aggregate Family Analytics
- Total household items
- Combined wear patterns
- Family-wide insights
- Budget tracking across all profiles

### Profile Performance Tracking
- Track each profile's wardrobe health over time
- Monitor improvements
- Set profile-specific goals

## ⚠️ Important Notes

### Backward Compatibility
- Works with and without `wardrobe_profile_id` column
- Gracefully handles missing data
- Falls back to main wardrobe if no profiles exist

### Data Isolation
- Each profile's data is completely separate
- No cross-profile data leakage
- Secure filtering by user_id and profile_id

### Performance
- Profile changes trigger fresh data fetch
- All computations re-run for new profile
- Memoized calculations prevent unnecessary re-renders

## 📝 Testing Checklist

- [x] Profile dropdown shows all profiles
- [x] Selecting profile updates analytics
- [x] URL updates when profile changes
- [x] URL parameter loads correct profile
- [x] "Main Wardrobe" shows non-profile items
- [x] Profile banner displays correct name
- [x] All metrics filter by selected profile
- [x] Page works without profiles
- [x] Page works with single profile
- [x] Page works with multiple profiles

## 🎉 Benefits

✅ **Organized**: Separate analytics for each family member  
✅ **Insightful**: Per-profile recommendations  
✅ **Shareable**: URL-based profile selection  
✅ **Flexible**: Works with 0 to N profiles  
✅ **Intuitive**: Clear visual indicators  
✅ **Fast**: Efficient database queries  

---

**Version**: 1.1.0 (Profile-Based)  
**Status**: ✅ Complete and Tested  
**Updated**: December 2024

