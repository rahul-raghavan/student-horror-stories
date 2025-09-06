import { Story } from '@/types/database'
import { supabase, supabaseAdmin } from './supabase'

// Check if we have valid Supabase configuration
function hasValidSupabaseConfig(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!(url && key && url !== 'your_supabase_url_here' && key !== 'your_supabase_anon_key_here')
}

// Fallback mock stories for development/testing
const defaultMockStories: Story[] = [
  {
    id: 'story-1',
    title: 'My Journey Through High School',
    content: `
      <p>High school has been one of the most transformative experiences of my life. When I first walked through those doors as a freshman, I was nervous, unsure of myself, and afraid of what the next four years would bring.</p>
      
      <p>But looking back now, I realize that every challenge I faced, every friendship I made, and every lesson I learned has shaped me into the person I am today. The late-night study sessions, the school plays, the sports games, and even the difficult conversations with teachers - they all mattered.</p>
      
      <p><strong>The most important thing I learned</strong> is that it's okay to not have everything figured out. It's okay to make mistakes, to ask for help, and to change your mind about what you want to do with your life.</p>
      
      <p>To anyone starting high school or going through it right now, remember: you're not alone. Everyone is figuring it out as they go, and that's perfectly normal. Trust yourself, be kind to others, and don't be afraid to step outside your comfort zone.</p>
    `,
    is_visible: true,
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z'
  },
  {
    id: 'story-2',
    title: 'The Power of Kindness',
    content: `
      <p>I used to think that being kind meant being weak. I thought that to succeed in life, you had to be tough, competitive, and sometimes even a little mean. But one day, everything changed.</p>
      
      <p>I was having a really bad day. I had failed a test I studied hard for, my friends were busy, and I felt completely alone. That's when Sarah, a girl I barely knew, sat down next to me at lunch and asked if I was okay.</p>
      
      <p>She didn't have to do that. She could have ignored me like everyone else. But her simple act of kindness made me realize that <em>kindness isn't weakness - it's strength</em>.</p>
      
      <p>Since then, I've tried to be more like Sarah. I've learned that a smile, a kind word, or just being there for someone can make all the difference in their day. And the amazing thing is, being kind to others makes me feel better too.</p>
      
      <p>Kindness is contagious. When you're kind to someone, they're more likely to be kind to others. It creates a ripple effect that can change the world, one small act at a time.</p>
    `,
    is_visible: true,
    created_at: '2024-01-12T14:30:00Z',
    updated_at: '2024-01-12T14:30:00Z'
  },
  {
    id: 'story-3',
    title: 'Learning to Fail',
    content: `
      <p>Failure used to terrify me. The thought of not being perfect, of disappointing my parents or teachers, kept me up at night. I would avoid trying new things because I was afraid I might not be good at them.</p>
      
      <p>But then I joined the school debate team. I was terrible at first - I stumbled over my words, my arguments were weak, and I lost every single debate for the first month. I wanted to quit.</p>
      
      <p>My coach, Mrs. Johnson, sat me down and said something that changed everything: <strong>"Every expert was once a beginner. Every pro was once an amateur. Every icon was once an unknown."</strong></p>
      
      <p>She was right. I kept practicing, kept learning from my mistakes, and slowly but surely, I got better. By the end of the year, I was captain of the debate team and we won the state championship.</p>
      
      <p>Now I understand that failure isn't the opposite of success - it's a stepping stone to success. Every time I fail, I learn something new. Every mistake teaches me how to do better next time.</p>
      
      <p>Don't be afraid to fail. Be afraid of not trying at all.</p>
    `,
    is_visible: true,
    created_at: '2024-01-14T09:15:00Z',
    updated_at: '2024-01-14T09:15:00Z'
  }
]

// Helper functions for localStorage (fallback when Supabase is not configured)
function getStoriesFromStorage(): Story[] {
  if (typeof window === 'undefined') {
    console.log('Server side - returning default stories')
    return defaultMockStories
  }
  
  try {
    const stored = localStorage.getItem('mock-stories')
    if (stored) {
      const parsed = JSON.parse(stored) as Story[]
      return parsed
    }
  } catch (error) {
    console.error('Error loading stories from storage:', error)
  }
  
  return defaultMockStories
}

function saveStoriesToStorage(stories: Story[]): void {
  if (typeof window === 'undefined') {
    return
  }
  
  try {
    localStorage.setItem('mock-stories', JSON.stringify(stories))
  } catch (error) {
    console.error('Error saving stories to storage:', error)
  }
}

export async function getRandomStory(): Promise<Story | null> {
  try {
    if (hasValidSupabaseConfig() && supabase) {
      console.log('🗄️ Using Supabase database for getRandomStory')
      const { data: stories, error } = await supabase
        .from('stories')
        .select('*')
        .eq('is_visible', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error in getRandomStory:', error)
        return null
      }

      if (stories && stories.length > 0) {
        const randomIndex = Math.floor(Math.random() * stories.length)
        return stories[randomIndex]
      }
      
      return null
    } else {
      console.log('📁 Using localStorage fallback for getRandomStory')
      const stories = getStoriesFromStorage()
      const visibleStories = stories.filter(story => story.is_visible)
      if (visibleStories.length === 0) {
        return null
      }
      
      const randomIndex = Math.floor(Math.random() * visibleStories.length)
      return visibleStories[randomIndex]
    }
  } catch (error) {
    console.error('Error in getRandomStory:', error)
    return null
  }
}

export async function getAllStories(): Promise<Story[]> {
  try {
    if (hasValidSupabaseConfig() && supabase) {
      console.log('🗄️ Using Supabase database for getAllStories')
      const { data: stories, error } = await supabase
        .from('stories')
        .select('*')
        .eq('is_visible', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error in getAllStories:', error)
        return []
      }

      return stories || []
    } else {
      console.log('📁 Using localStorage fallback for getAllStories')
      const stories = getStoriesFromStorage()
      const visibleStories = stories.filter(story => story.is_visible)
      return visibleStories.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }
  } catch (error) {
    console.error('Error in getAllStories:', error)
    return []
  }
}

export async function getStoryById(id: string): Promise<Story | null> {
  try {
    if (hasValidSupabaseConfig() && supabase) {
      console.log('🗄️ Using Supabase database for getStoryById')
      const { data: story, error } = await supabase
        .from('stories')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Supabase error in getStoryById:', error)
        return null
      }

      return story
    } else {
      console.log('📁 Using localStorage fallback for getStoryById')
      const stories = getStoriesFromStorage()
      const story = stories.find(s => s.id === id)
      return story || null
    }
  } catch (error) {
    console.error('Error in getStoryById:', error)
    return null
  }
}

export async function createStory(title: string, content: string, isVisible: boolean = true): Promise<boolean> {
  try {
    if (hasValidSupabaseConfig() && supabaseAdmin) {
      console.log('🗄️ Using Supabase database for createStory')
      const { error } = await supabaseAdmin
        .from('stories')
        .insert([
          {
            title,
            content,
            is_visible: isVisible
          }
        ])

      if (error) {
        console.error('Supabase error in createStory:', error)
        return false
      }

      console.log('✅ Story created successfully in Supabase')
      return true
    } else {
      console.log('📁 Using localStorage fallback for createStory')
      const stories = getStoriesFromStorage()
      const newStory: Story = {
        id: `story-${Date.now()}`,
        title,
        content,
        is_visible: isVisible,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      stories.push(newStory)
      saveStoriesToStorage(stories)
      console.log('Story created in localStorage:', newStory)
      return true
    }
  } catch (error) {
    console.error('Error creating story:', error)
    return false
  }
}

export async function updateStory(id: string, title: string, content: string, isVisible: boolean): Promise<boolean> {
  try {
    if (hasValidSupabaseConfig() && supabaseAdmin) {
      console.log('🗄️ Using Supabase database for updateStory')
      const { error } = await supabaseAdmin
        .from('stories')
        .update({
          title,
          content,
          is_visible: isVisible,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) {
        console.error('Supabase error in updateStory:', error)
        return false
      }

      console.log('✅ Story updated successfully in Supabase')
      return true
    } else {
      console.log('📁 Using localStorage fallback for updateStory')
      const stories = getStoriesFromStorage()
      const storyIndex = stories.findIndex(s => s.id === id)
      if (storyIndex > -1) {
        stories[storyIndex] = {
          ...stories[storyIndex],
          title,
          content,
          is_visible: isVisible,
          updated_at: new Date().toISOString()
        }
        saveStoriesToStorage(stories)
        console.log('Story updated in localStorage:', stories[storyIndex])
        return true
      }
      return false
    }
  } catch (error) {
    console.error('Error updating story:', error)
    return false
  }
}

export async function updateStoryVisibility(id: string, isVisible: boolean): Promise<boolean> {
  try {
    if (hasValidSupabaseConfig() && supabaseAdmin) {
      console.log('🗄️ Using Supabase database for updateStoryVisibility')
      const { error } = await supabaseAdmin
        .from('stories')
        .update({
          is_visible: isVisible,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) {
        console.error('Supabase error in updateStoryVisibility:', error)
        return false
      }

      console.log('✅ Story visibility updated successfully in Supabase')
      return true
    } else {
      console.log('📁 Using localStorage fallback for updateStoryVisibility')
      const stories = getStoriesFromStorage()
      const story = stories.find(s => s.id === id)
      if (story) {
        story.is_visible = isVisible
        story.updated_at = new Date().toISOString()
        saveStoriesToStorage(stories)
        console.log('Story visibility updated in localStorage:', story)
        return true
      }
      return false
    }
  } catch (error) {
    console.error('Error updating story visibility:', error)
    return false
  }
}

export async function deleteStory(id: string): Promise<boolean> {
  try {
    if (hasValidSupabaseConfig() && supabaseAdmin) {
      console.log('🗄️ Using Supabase database for deleteStory')
      const { error } = await supabaseAdmin
        .from('stories')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Supabase error in deleteStory:', error)
        return false
      }

      console.log('✅ Story deleted successfully from Supabase')
      return true
    } else {
      console.log('📁 Using localStorage fallback for deleteStory')
      const stories = getStoriesFromStorage()
      const storyIndex = stories.findIndex(s => s.id === id)
      if (storyIndex > -1) {
        stories.splice(storyIndex, 1)
        saveStoriesToStorage(stories)
        console.log('Story deleted from localStorage:', id)
        return true
      }
      return false
    }
  } catch (error) {
    console.error('Error deleting story:', error)
    return false
  }
}