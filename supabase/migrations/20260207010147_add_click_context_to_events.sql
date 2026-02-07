-- Add click_context column to events table to capture what was actually shown to user
-- This enables optimization of ad copy based on what actually converts

ALTER TABLE events
ADD COLUMN click_context TEXT;

-- Add index for analytics queries
CREATE INDEX idx_events_click_context ON events(click_context) WHERE click_context IS NOT NULL;

COMMENT ON COLUMN events.click_context IS
  'The actual message/text shown to the user that they clicked. ' ||
  'Captures how developers rewrote/presented the ad creative. ' ||
  'Used for conversion optimization and A/B testing.';

-- Log the change
DO $$
BEGIN
  RAISE NOTICE '✅ Added click_context column to events table';
  RAISE NOTICE '   This column captures the actual ad presentation that led to clicks';
  RAISE NOTICE '   Enables data-driven optimization of ad creative';
END $$;
