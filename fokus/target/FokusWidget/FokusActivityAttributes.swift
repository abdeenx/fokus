// Shared between the main app target and the FokusWidget extension target.
// The Expo config plugin copies this file into ios/Fokus/ in addition to
// ios/FokusWidget/ so both targets compile it. Apple's Live Activity APIs match
// activity attribute types by their unqualified Swift name, so having the same
// source in both targets is the supported approach.

import Foundation

#if canImport(ActivityKit)
import ActivityKit

@available(iOS 16.1, *)
public struct FokusActivityAttributes: ActivityAttributes {
    public typealias FokusStatus = ContentState

    public struct ContentState: Codable, Hashable {
        public var text: String
        public var category: String        // "focus" | "goal" | "quote" | "reminder"
        public var startedAt: Date

        public init(text: String, category: String, startedAt: Date) {
            self.text = text
            self.category = category
            self.startedAt = startedAt
        }
    }

    public var sessionId: String

    public init(sessionId: String) {
        self.sessionId = sessionId
    }
}
#endif
