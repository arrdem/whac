package com.schlaf.steam.activities.chrono;

import java.lang.ref.WeakReference;

import android.app.Activity;
import android.content.Context;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.os.SystemClock;
import android.os.Vibrator;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.actionbarsherlock.app.SherlockFragment;
import com.schlaf.steam.R;
import com.schlaf.steam.activities.battle.BattleSingleton;
import com.schlaf.steam.activities.chrono.ChronoRunnable.ChronoObserver;

public class ChronoFragment extends SherlockFragment implements
		OnClickListener, ChronoObserver {

	private static final int TICK_WHAT = 2;
	
	public static final String ID = "chronoFragment";

	/** chrono is displayed full screen --> show clocks */
	private boolean fullScreen;
	/** chrono may shrink/expand --> show buttons */
	private boolean showSlideButtons;
	
	/**
	 * internal handler for chrono threading
	 * @author S0085289
	 *
	 */
	private static class ChronoHandler extends Handler {
		
		private final WeakReference<ChronoFragment> mFragment;
		
		public ChronoHandler(ChronoFragment parentFragment) {
			mFragment = new WeakReference<ChronoFragment>(parentFragment);
		}
		
		public void handleMessage(Message m) {
			if (BattleSingleton.getInstance().getPlayer1Chrono().isRunning() || 
					BattleSingleton.getInstance().getPlayer2Chrono().isRunning() ) {
				// enqueue message to treat in one second
				Log.d("ChronoHandler", "handleMessage - enqueue new message");
				sendMessageDelayed(Message.obtain(this, TICK_WHAT), 1000);
				
				ChronoFragment fragment = mFragment.get();
				if (fragment != null) {
					fragment.updateDisplay();
				}
			}
		}
	}
	
	ImageButton button1;
	ImageButton button2;
	ImageButton buttonPauseAll;

	TextView tv1;
	TextView tv2;
	
	CountDownView countDownView1;
	CountDownView countDownView2;
	
	LinearLayout player1TimeZone;
	LinearLayout player2TimeZone;
	
	ImageButton shrinkButton;
	ImageButton expandButton;

	ChronoHandler mHandler;

	public interface ChronoActivityInterface {
		public void setInitialMinuteCount(int nbMinutes);
		
		public void openChronoConfig(View v);
		
		public void shrinkChrono(View v);
		
		public void expandChrono(View v);

	}

	@Override
	public void onAttach(Activity activity) {
		if (activity instanceof ChronoActivityInterface) {
			Log.d("ChronoFragment", "onAttach received "
					+ activity.getClass().getName());
		} else {
			throw new UnsupportedOperationException(
					"ChronoFragment requires a ChronoActivityInterface as parent activity");
		}
		super.onAttach(activity);
	}

	@Override
	public void onActivityCreated(Bundle savedInstanceState) {
		Log.d("ChronoFragment", "ChronoFragment.onActivityCreated");
		super.onActivityCreated(savedInstanceState);

	}

	@Override
	public View onCreateView(LayoutInflater inflater, ViewGroup container,
			Bundle savedInstanceState) {
		Log.d("ChronoFragment", "ChronoFragment.onCreateView");

		mHandler = new ChronoHandler(this);
		
		View view = inflater
				.inflate(R.layout.chrono_fragment, container, false);

		button1 = (ImageButton) view.findViewById(R.id.buttonStartPause1);
		button2 = (ImageButton) view.findViewById(R.id.buttonStartPause2);
		buttonPauseAll = (ImageButton) view.findViewById(R.id.pauseButton);

		button1.setOnClickListener(this);
		button2.setOnClickListener(this);
		buttonPauseAll.setOnClickListener(this);

		player1TimeZone = (LinearLayout) view.findViewById(R.id.player1TimeZone);
		player2TimeZone = (LinearLayout) view.findViewById(R.id.player2TimeZone);

		tv1 = (TextView) view.findViewById(R.id.tv1);
		tv2 = (TextView) view.findViewById(R.id.tv2);
		
		countDownView1 = (CountDownView) view.findViewById(R.id.countDownView1);
		countDownView1.setColor(CountDownView.RED);
		countDownView1.setOnClickListener(this);
		
		countDownView2 = (CountDownView) view.findViewById(R.id.countDownView2);
		countDownView2.setColor(CountDownView.BLUE);
		countDownView2.setOnClickListener(this);
		
		
		shrinkButton = (ImageButton) view.findViewById(R.id.shrinkButton);
		expandButton = (ImageButton) view.findViewById(R.id.expandButton);

		updateRunning();
		
		return view;
	}
	
	
	@Override
    public void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
    }



	@Override
	public void onClick(View v) {
		
		boolean shouldStartRunning = false;
		boolean everythingWasStopped = false;
		if (BattleSingleton.getInstance().getPlayer1Chrono().isPaused() &&
					BattleSingleton.getInstance().getPlayer2Chrono().isPaused()) {
			everythingWasStopped = true;
			// think to start the ticker!
		}
		
		if (v.getId() == R.id.pauseButton) {
			BattleSingleton.getInstance().getPlayer1Chrono().pause(SystemClock.elapsedRealtime());
			BattleSingleton.getInstance().getPlayer2Chrono().pause(SystemClock.elapsedRealtime());
		}
		
		if ( v.getId() == R.id.countDownView1 || v.getId() == R.id.countDownView2) {
		
			shouldStartRunning = true;
			if (BattleSingleton.getInstance().getPlayer1Chrono().isPaused() &&
					BattleSingleton.getInstance().getPlayer2Chrono().isPaused()) {
				// all paused, start the one clicked
				if (v.getId() == R.id.countDownView1) {
					BattleSingleton.getInstance().getPlayer1Chrono().startResume(SystemClock.elapsedRealtime());
				}
				if (v.getId() == R.id.countDownView2) {
					BattleSingleton.getInstance().getPlayer2Chrono().startResume(SystemClock.elapsedRealtime());
				}
				

			} else {
				// flip flop
				if (BattleSingleton.getInstance().getPlayer1Chrono().isPaused()) {
					BattleSingleton.getInstance().getPlayer1Chrono().startResume(SystemClock.elapsedRealtime());
					BattleSingleton.getInstance().getPlayer2Chrono().pause(SystemClock.elapsedRealtime());
				} else {
					BattleSingleton.getInstance().getPlayer2Chrono().startResume(SystemClock.elapsedRealtime());
					BattleSingleton.getInstance().getPlayer1Chrono().pause(SystemClock.elapsedRealtime());
				}
			}
		}
			
		
		if (v.getId() == R.id.buttonStartPause1 ) {
			if (BattleSingleton.getInstance().getPlayer1Chrono().isPaused()) {
				BattleSingleton.getInstance().getPlayer1Chrono().startResume(SystemClock.elapsedRealtime());
				shouldStartRunning = true;
				BattleSingleton.getInstance().getPlayer2Chrono().pause(SystemClock.elapsedRealtime());
			} else {
				BattleSingleton.getInstance().getPlayer1Chrono().pause(SystemClock.elapsedRealtime());
			}
		}
		if (v.getId() == R.id.buttonStartPause2 ) {
			if (BattleSingleton.getInstance().getPlayer2Chrono().isPaused()) {
				BattleSingleton.getInstance().getPlayer2Chrono().startResume(SystemClock.elapsedRealtime());
				shouldStartRunning = true;
				BattleSingleton.getInstance().getPlayer1Chrono().pause(SystemClock.elapsedRealtime());
			} else {
				BattleSingleton.getInstance().getPlayer2Chrono().pause(SystemClock.elapsedRealtime());
			}
		}

		if (everythingWasStopped) {
			if (shouldStartRunning) {
				updateRunning();
			}
		}
		updateDisplay(); // just in case.
		// 
	}

	@Override
	public void notifyCurrentChronoValue(final String chronoValue) {

	}

	private void updateRunning() {
		Log.d("ChronoFragment", "updateRunning");
		if (BattleSingleton.getInstance().getPlayer1Chrono().isRunning()  || 
				BattleSingleton.getInstance().getPlayer2Chrono().isRunning() ) {
			dispatchChronometerTick();
			mHandler.sendMessageDelayed(Message.obtain(mHandler, TICK_WHAT),
					1000);
		} else {
			// no chrono running, no need to calculate times...
			Log.d("ChronoFragment", "handleMessage - delete queue");
			mHandler.removeMessages(TICK_WHAT);
		}
		updateDisplay();
		
	}

	private void endClockVibrate() {
		Vibrator v = (Vibrator) getActivity().getSystemService(Context.VIBRATOR_SERVICE);
		v.vibrate(new long[]{0,  300, 300, 300, 300, 300}, -1);
	}
	
	public void updateDisplay() {
		
		Log.d("ChronoFragment", "updateDisplay");
		
		if (BattleSingleton.getInstance().getPlayer1Chrono().getTimeRemainingMillis() < 0) {
			BattleSingleton.getInstance().getPlayer1Chrono().pause(SystemClock.elapsedRealtime());
			BattleSingleton.getInstance().getPlayer1Chrono().setInitialPlayerTimeInMillis(0);
			endClockVibrate();
		}
		
		if (BattleSingleton.getInstance().getPlayer2Chrono().getTimeRemainingMillis() < 0) {
			BattleSingleton.getInstance().getPlayer2Chrono().pause(SystemClock.elapsedRealtime());
			BattleSingleton.getInstance().getPlayer2Chrono().setInitialPlayerTimeInMillis(0);
			endClockVibrate();
		}

		String time1String = BattleSingleton.getInstance().getPlayer1Chrono().getTimeRemainingString();
		tv1.setText(time1String);
		countDownView1.updateTime(BattleSingleton.getInstance().getPlayer1Chrono().getTimeRemainingMillis(), BattleSingleton.getInstance().getPlayer1Chrono().isRunning());

		
		String time2String = BattleSingleton.getInstance().getPlayer2Chrono().getTimeRemainingString();
		tv2.setText(time2String);
		countDownView2.updateTime(BattleSingleton.getInstance().getPlayer2Chrono().getTimeRemainingMillis(), BattleSingleton.getInstance().getPlayer2Chrono().isRunning());

		if (BattleSingleton.getInstance().getPlayer1Chrono().isPaused()) {
			button1.setImageResource(R.drawable.ic_media_play);	
		} else {
			button1.setImageResource(R.drawable.ic_media_pause);
		}

		
		if (BattleSingleton.getInstance().getPlayer2Chrono().isPaused()) {
			button2.setImageResource(R.drawable.ic_media_play);	
		} else {
			button2.setImageResource(R.drawable.ic_media_pause);
		}
		
		
	}
	
	
	void dispatchChronometerTick() {
		// BattleSingleton.getInstance().setPlayer1remainingTimeInMillis(0);
	}

	public void setFullScreen(boolean fullScreen) {
		this.fullScreen = fullScreen;
		
		if (fullScreen) {
			countDownView1.setVisibility(View.VISIBLE);
			countDownView2.setVisibility(View.VISIBLE);
			buttonPauseAll.setVisibility(View.VISIBLE);
			player1TimeZone.setVisibility(View.GONE);
			player2TimeZone.setVisibility(View.GONE);
		} else {
			countDownView1.setVisibility(View.GONE);
			countDownView2.setVisibility(View.GONE);
			buttonPauseAll.setVisibility(View.GONE);
			player1TimeZone.setVisibility(View.VISIBLE);
			player2TimeZone.setVisibility(View.VISIBLE);
		}
	}

	public void setShowSlideButtons(boolean showSlideButtons) {
		this.showSlideButtons = showSlideButtons;
		
		if (showSlideButtons) {
			if (fullScreen) {
				expandButton.setVisibility(View.GONE);
				shrinkButton.setVisibility(View.VISIBLE);
			} else {
				expandButton.setVisibility(View.VISIBLE);
				shrinkButton.setVisibility(View.GONE);
			}
		} else {
			expandButton.setVisibility(View.GONE);
			shrinkButton.setVisibility(View.GONE);
		}
	}

	

	
}
