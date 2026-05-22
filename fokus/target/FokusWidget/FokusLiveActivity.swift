import SwiftUI
import WidgetKit

#if canImport(ActivityKit)
import ActivityKit

// MARK: - Helpers

@available(iOS 16.1, *)
private extension FokusActivityAttributes.ContentState {
    var iconName: String {
        switch category {
        case "goal": return "flag.fill"
        case "quote": return "quote.bubble.fill"
        case "reminder": return "bell.fill"
        default: return "target"
        }
    }

    var displayLabel: String {
        switch category {
        case "goal": return "Goal"
        case "quote": return "Quote"
        case "reminder": return "Reminder"
        default: return "Today's Focus"
        }
    }

    var elapsedLabel: String {
        let elapsed = Date().timeIntervalSince(startedAt)
        let minutes = Int(elapsed / 60)
        if minutes < 1 { return "just now" }
        if minutes < 60 { return "\(minutes) min" }
        let hours = minutes / 60
        return "\(hours)h \(minutes % 60)m"
    }
}

// MARK: - Lock Screen banner

@available(iOS 16.1, *)
struct FokusLockScreenLiveView: View {
    let state: FokusActivityAttributes.ContentState

    var body: some View {
        HStack(alignment: .center, spacing: 14) {
            ZStack {
                Circle()
                    .fill(.ultraThinMaterial)
                    .overlay(Circle().strokeBorder(Color.white.opacity(0.45), lineWidth: 0.6))
                Image(systemName: state.iconName)
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(.white)
            }
            .frame(width: 44, height: 44)

            VStack(alignment: .leading, spacing: 4) {
                Text(state.displayLabel.uppercased())
                    .font(.system(size: 10, weight: .bold))
                    .tracking(0.8)
                    .foregroundColor(.white.opacity(0.85))
                Text(state.text)
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(.white)
                    .lineLimit(2)
                    .minimumScaleFactor(0.8)
            }

            Spacer(minLength: 0)

            VStack(alignment: .trailing, spacing: 2) {
                Text("ACTIVE")
                    .font(.system(size: 9, weight: .heavy))
                    .tracking(0.8)
                    .foregroundColor(Color(red: 0.96, green: 0.62, blue: 0.04))
                Text(state.elapsedLabel)
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(.white.opacity(0.85))
            }
        }
        .padding(.horizontal, 18)
        .padding(.vertical, 14)
    }
}

// MARK: - Dynamic Island

@available(iOS 16.2, *)
struct FokusDynamicIsland {
    static func compactLeading(_ state: FokusActivityAttributes.ContentState) -> some View {
        Image(systemName: state.iconName)
            .font(.system(size: 14, weight: .semibold))
            .foregroundColor(Color(red: 0.65, green: 0.7, blue: 1.0))
    }

    static func compactTrailing(_ state: FokusActivityAttributes.ContentState) -> some View {
        Text(state.text)
            .font(.system(size: 13, weight: .semibold))
            .lineLimit(1)
            .foregroundColor(.white)
            .frame(maxWidth: 120, alignment: .trailing)
    }

    static func minimal(_ state: FokusActivityAttributes.ContentState) -> some View {
        Image(systemName: state.iconName)
            .font(.system(size: 14, weight: .semibold))
            .foregroundColor(Color(red: 0.65, green: 0.7, blue: 1.0))
    }
}

// MARK: - Live Activity widget

@available(iOS 16.2, *)
struct FokusLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: FokusActivityAttributes.self) { context in
            ZStack {
                LinearGradient(
                    gradient: Gradient(colors: [
                        Color(red: 0.31, green: 0.275, blue: 0.898),
                        Color(red: 0.263, green: 0.22, blue: 0.792)
                    ]),
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                LinearGradient(
                    gradient: Gradient(colors: [
                        Color.white.opacity(0.22),
                        Color.white.opacity(0.0)
                    ]),
                    startPoint: .topLeading,
                    endPoint: .center
                )
                FokusLockScreenLiveView(state: context.state)
            }
            .activityBackgroundTint(Color(red: 0.263, green: 0.22, blue: 0.792))
            .activitySystemActionForegroundColor(.white)
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    HStack(spacing: 8) {
                        ZStack {
                            Circle()
                                .fill(.ultraThinMaterial)
                                .overlay(Circle().strokeBorder(Color.white.opacity(0.45), lineWidth: 0.6))
                            Image(systemName: context.state.iconName)
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(.white)
                        }
                        .frame(width: 32, height: 32)
                        Text(context.state.displayLabel)
                            .font(.system(size: 12, weight: .heavy))
                            .foregroundColor(.white.opacity(0.85))
                    }
                    .padding(.leading, 4)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    VStack(alignment: .trailing, spacing: 2) {
                        Text("ACTIVE")
                            .font(.system(size: 9, weight: .heavy))
                            .tracking(0.8)
                            .foregroundColor(Color(red: 0.96, green: 0.62, blue: 0.04))
                        Text(context.state.elapsedLabel)
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(.white.opacity(0.85))
                    }
                    .padding(.trailing, 4)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text(context.state.text)
                        .font(.system(size: 17, weight: .bold))
                        .foregroundColor(.white)
                        .lineLimit(3)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal, 4)
                        .padding(.top, 4)
                }
            } compactLeading: {
                FokusDynamicIsland.compactLeading(context.state)
            } compactTrailing: {
                FokusDynamicIsland.compactTrailing(context.state)
            } minimal: {
                FokusDynamicIsland.minimal(context.state)
            }
            .widgetURL(URL(string: "fokus://"))
            .keylineTint(Color(red: 0.65, green: 0.7, blue: 1.0))
        }
    }
}
#endif
