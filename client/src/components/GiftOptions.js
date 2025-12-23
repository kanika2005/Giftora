import React, { useState } from 'react';

export default function GiftOptions({ product, onOptionsChange }) {
  const [giftWrapping, setGiftWrapping] = useState(false);
  const [personalization, setPersonalization] = useState({
    enabled: false,
    type: 'message',
    text: ''
  });

  const handleGiftWrappingChange = (enabled) => {
    setGiftWrapping(enabled);
    onOptionsChange({
      giftWrapping: enabled,
      personalization
    });
  };

  const handlePersonalizationChange = (field, value) => {
    const updated = { ...personalization, [field]: value };
    setPersonalization(updated);
    onOptionsChange({
      giftWrapping,
      personalization: updated
    });
  };

  const hasGiftOptions = product?.giftOptions;
  const allowsWrapping = hasGiftOptions?.allowsWrapping !== false;
  const allowsPersonalization = hasGiftOptions?.allowsPersonalization === true;
  const wrappingPrice = hasGiftOptions?.wrappingPrice || 5;
  const personalizationPrice = hasGiftOptions?.personalizationPrice || 10;
  const personalizationTypes = hasGiftOptions?.personalizationTypes || ['message'];

  if (!allowsWrapping && !allowsPersonalization) {
    return null;
  }

  return (
    <div className="border rounded-lg p-4 bg-gray-50 mb-4">
      <h3 className="font-semibold mb-3 text-lg">🎁 Gift Options</h3>

      {allowsWrapping && (
        <div className="mb-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={giftWrapping}
              onChange={(e) => handleGiftWrappingChange(e.target.checked)}
              className="mr-2 h-4 w-4"
            />
            <span className="flex-1">
              Add Gift Wrapping
              <span className="text-sm text-gray-600 ml-2">(+₹{wrappingPrice})</span>
            </span>
          </label>
          {giftWrapping && (
            <p className="text-sm text-gray-600 mt-2 ml-6">
              Your gift will be beautifully wrapped with a ribbon and card.
            </p>
          )}
        </div>
      )}

      {allowsPersonalization && (
        <div>
          <label className="flex items-center cursor-pointer mb-2">
            <input
              type="checkbox"
              checked={personalization.enabled}
              onChange={(e) => handlePersonalizationChange('enabled', e.target.checked)}
              className="mr-2 h-4 w-4"
            />
            <span className="flex-1">
              Add Personalization
              <span className="text-sm text-gray-600 ml-2">(+₹{personalizationPrice})</span>
            </span>
          </label>

          {personalization.enabled && (
            <div className="ml-6 space-y-3">
              {personalizationTypes.length > 1 && (
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={personalization.type}
                    onChange={(e) => handlePersonalizationChange('type', e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  >
                    {personalizationTypes.map(type => (
                      <option key={type} value={type}>
                        {type === 'message' ? 'Gift Message' : 
                         type === 'engraving' ? 'Engraving' : 
                         'Custom Text'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  {personalization.type === 'engraving' ? 'Engraving Text' : 
                   personalization.type === 'custom-text' ? 'Custom Text' : 
                   'Your Message'}
                </label>
                <textarea
                  value={personalization.text}
                  onChange={(e) => handlePersonalizationChange('text', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  rows="3"
                  maxLength="200"
                  placeholder={
                    personalization.type === 'engraving' 
                      ? 'Enter text to be engraved (max 200 chars)' 
                      : 'Enter your personalized message (max 200 chars)'
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  {personalization.text.length}/200 characters
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {(giftWrapping || personalization.enabled) && (
        <div className="mt-4 pt-3 border-t border-gray-300">
          <p className="text-sm font-semibold">
            Additional charges: ₹
            {(giftWrapping ? wrappingPrice : 0) + (personalization.enabled ? personalizationPrice : 0)}
          </p>
        </div>
      )}
    </div>
  );
}
